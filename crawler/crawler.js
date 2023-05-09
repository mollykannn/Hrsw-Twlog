const puppeteer = require("puppeteer");
const fs = require("fs");
const client = require('https');
const stdio = require('stdio');
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const cmd = stdio.getopt({
  'from': { key: 'from', description: 'from', args: 1 },
  'to': { key: 'to', description: 'to', args: '*', required: false },
  'user': { key: 'user', description: 'user', args: 1 },
  'action': { key: 'action', description: 'action', required: false, args: 1, default: 'default' },
});
// File path
const file = `../Twitter/${cmd.from}.md`;
// Build folder
if (!fs.existsSync("../Twitter")) fs.mkdirSync("../Twitter");
if (!fs.existsSync("../Twitter/images")) fs.mkdirSync("../Twitter/images");
const action = cmd.action === 'daily' ? "daily" : 'default'
// Write header
const header = cmd.to ? "" : `---
title: ${cmd.from}
---
`;
fs.writeFile(file, header, (err) => {
  if (err) throw err;
});

const formatDate = (date) => {
  const dateTimezone = dayjs(date.replace(' · ', ' ')).tz('Asia/Tokyo');
  return { 'displayDate': dateTimezone.format('D MMM, YYYY hh:mm A'), 'shortDate': dateTimezone.format('YYYY-MM-DD') };
}

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
}

(async () => {
  let tweetDate = '';
  let postNumber = 0;
  const browser = await puppeteer.launch({
    headless: 'new'
  });
  const page = await browser.newPage();
  const since = dayjs(cmd.from).subtract(1, 'day').format('YYYY-MM-DD'); // Twitter return UTC time, subtract 1 day to get tweet from 15:00 to 24:00 (UTC)
  const until = dayjs(cmd.to ?? cmd.from).add(1, 'day').format('YYYY-MM-DD');
  const crawlerURL = action === 'daily' ? `https://nitter.nl/${cmd.user}` : `https://nitter.nl/${cmd.user}/search?f=tweets&q=&since=${since}&until=${until}`
  await page.goto(crawlerURL);
  console.log(`Crawler URL: ${crawlerURL}`);
  await page.exposeFunction("formatDate", formatDate);
  await page.exposeFunction("downloadImage", downloadImage);

  while (true) {
    const result = await page.evaluate(async (cmd, postNumber, tweetDate) => {
      const getUserNameContent = (element) => {
        const fullName = element.querySelector(".fullname").innerText;
        const username = element.querySelector(".username");
        return `[${fullName} ${username.innerText}](https://twitter.com${username?.getAttribute("href")})`;
      }
      const getPostContent = async (element, action) => {
        let data = '';
        const contentClass = action === 'tweet' ? '.tweet-content' : '.quote-text';
        const quoteText = action === 'tweet' ? '' : '> ';
        const link = element.querySelector(`.${action}-link`);
        const date = element.querySelector(".tweet-date a")?.getAttribute("title");
        const content = element.querySelector(contentClass)?.innerHTML.replaceAll('href="/search?q=%23', 'href="https://twitter.com/search?q=%23').replaceAll('invidious.nl', 'youtube.com').replaceAll('\n', '  \n');
        const isRetweet = element.querySelector(".retweet-header");
        const isReply = element.querySelector(`${action === 'tweet' ? 'div:not([class^="tweet-name-row"])' : '.tweet-name-row'}+.replying-to a`);
        const isImage = element.querySelectorAll(`${action === 'tweet' ? `${contentClass} + ` : ''}.attachments .attachment`);
        const isQuote = element.querySelector(".quote");
        const dateResult = await formatDate(date);
        if ((dateResult.shortDate > (cmd.to ?? cmd.from) || dateResult.shortDate < cmd.from) && action === 'tweet') {
          tweetDate = dateResult.shortDate;
          return ''
        }; // Skip post
        if (tweetDate != dateResult.shortDate && action === 'tweet') {
          postNumber = 0;
          tweetDate = dateResult.shortDate;
          data += `# ${dateResult.shortDate}\n\n`;
        }
        postNumber += 1;

        data += `${quoteText}[${dateResult.displayDate}](${link?.toString().replaceAll('https://nitter.nl/', 'https://twitter.com/')})\n${quoteText}\n`;
        data += action === 'tweet' ? '' : `${quoteText}${getUserNameContent(element)}\n${quoteText}\n`;
        if (isRetweet) {
          data += `${quoteText}Retweet from ${getUserNameContent(element.querySelector(".tweet-header"))}\n${quoteText}\n`;
        }
        if (isReply) {
          data += `${quoteText}Replying to [${isReply.innerText}](https://twitter.com${isReply?.getAttribute("href")})\n${quoteText}\n`;
        }
        data += `${quoteText}${action === 'tweet' ? content : content.replaceAll('\n', '\n>')}\n`;
        if (isQuote) {
          data += await getPostContent(isQuote, 'quote');
        }
        if (isImage) {
          for (let [index, element] of isImage.entries()) {
            await downloadImage(`https://nitter.nl${element.querySelector('img')?.getAttribute("src")}`, `../Twitter/images/${cmd.from}-${postNumber}-${index}.png`);
            data += `${quoteText}![image](images/${cmd.from}-${postNumber}-${index}.png)\n`;
          }
        }
        if (action === 'tweet') {
          data += `\n---\n\n`;
        }
        return data;
      }

      const elements = document.querySelectorAll(".timeline-item:not(.show-more)");
      let data = '';
      for (let element of elements) {
        data += await getPostContent(element, 'tweet');
      }
      return { data: data, date: tweetDate, postNumber: postNumber };
    }, cmd, postNumber, tweetDate);

    // Write data
    tweetDate = result.date;
    postNumber = result.postNumber;
    fs.appendFile(file, result.data, (err) => {
      if (err) throw err;
    });

    // Next page
    const [buttonSelector] = await page.$x("//a[contains(., 'Load more')]")
    if (buttonSelector && tweetDate >= cmd.from) {
      await Promise.all([
        page.waitForNavigation(),
        buttonSelector.click(),
      ]);
    } else {
      const data = fs.readFileSync(file, 'utf-8');
      if (data === header) fs.unlinkSync(file);
      break;
    }
  }
  await browser.close();
})();
