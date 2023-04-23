const puppeteer = require("puppeteer");
const fs = require("fs");
const client = require('https');
const stdio = require('stdio');
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const dir = "../Twitter";
const dirImage = "../Twitter/images";

const cmd = stdio.getopt({
  'from': { key: 'from', description: 'from', args: 1 },
  'to': { key: 'to', description: 'to', args: '*', required: false },
  'user': { key: 'user', description: 'user', args: 1 }
});
const file = `../Twitter/${cmd.from}.md`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
if (!fs.existsSync(dirImage)) {
  fs.mkdirSync(dirImage);
}

const header = cmd.to ? "" : `---
title: ${cmd.from}
---
`;
fs.writeFile(file, header, (err) => {
  if (err) throw err;
});

const formatDate = (date) => {
  let dateTimezone = dayjs(date.replace(' · ', ' ')).tz('Asia/Tokyo');
  return [dateTimezone.format('D MMM, YYYY hh:mm A'), dateTimezone.format('YYYY-MM-DD')];
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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const subtractDay = dayjs(cmd.from).subtract(1, 'day').format('YYYY-MM-DD'); // Get UTC15:00-24:00 
  cmd.until = dayjs(cmd.to ?? cmd.from).add(1, 'day').format('YYYY-MM-DD'); 
  await page.goto(`https://nitter.net/${cmd.user}/search?f=tweets&q=&since=${subtractDay}&until=${cmd.until}`);
  console.log(`https://nitter.net/${cmd.user}/search?f=tweets&q=&since=${subtractDay}&until=${cmd.until}`);
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
        const content = element.querySelector(contentClass)?.innerHTML.replaceAll('href="/search?q=%23', 'href="https://twitter.com/search?q=%23');
        const isRetweet = element.querySelector(".retweet-header");
        const isReply = element.querySelector(`${ action === 'tweet' ? 'div:not([class^="tweet-name-row"])' : '.tweet-name-row'}+.replying-to a`);
        const isImage = element.querySelectorAll(`${action === 'tweet' ? contentClass + ' + ' : ''}.attachments .attachment`);
        const isQuote = element.querySelector(".quote");
        let dateFormat = await formatDate(date.toString());
        if ((dateFormat[1] > (cmd.to ?? cmd.from) || dateFormat[1] < cmd.from) && action === 'tweet') return ''; // Skip Post
        if (tweetDate != dateFormat[1] && action === 'tweet') {
          postNumber = 0;
          tweetDate = dateFormat[1];
          data += `# ${dateFormat[1]}\n\n`;
        }
        postNumber += 1;

        data += `${quoteText}[${dateFormat[0]}](${link?.toString().replaceAll('https://nitter.net/', 'https://twitter.com/')})\n${quoteText}\n`;
        data += action === 'tweet' ? '' : `${quoteText}${getUserNameContent(element)}\n${quoteText}\n`;
        if (isRetweet) {
          data += `${quoteText}Retweet from ${getUserNameContent(element.querySelector(".tweet-header"))}\n${quoteText}\n`;
        }
        if (isReply) {
          data += `${quoteText}Replying to [${isReply.innerText}](https://twitter.com${isReply?.getAttribute("href")})\n${quoteText}\n`;
        }
        data += `${quoteText}${action === 'tweet' ? content : content.replaceAll('\n','\n>')}\n`;
        if (isQuote) {
          data += await getPostContent(isQuote, 'quote');
        }
        if (isImage) {
          for (let [index, element] of isImage.entries()) {
            await downloadImage(`https://nitter.net${element.querySelector('img')?.getAttribute("src")}`, `../Twitter/images/${cmd.from}-${postNumber}-${index}.png`);
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
      return {result: data, date: tweetDate, postNumber: postNumber};
    }, cmd, postNumber, tweetDate);

    tweetDate = result.date;
    postNumber = result.postNumber;
    fs.appendFile(file, result.result, (err) => {
      if (err) throw err;
    });

    const [buttonSelector] = await page.$x("//a[contains(., 'Load more')]")
    if (buttonSelector) {
      await Promise.all([
        page.waitForNavigation(),
        buttonSelector.click(),
      ]);
    } else {
      let data = fs.readFileSync(file, 'utf-8');
      if (data === header) fs.unlinkSync(file);
      break;
    }
  }
  await browser.close();
})();
