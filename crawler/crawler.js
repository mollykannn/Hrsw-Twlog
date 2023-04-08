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
  'to': { key: 'to', description: 'to', args: 1 },
  'user': { key: 'to', description: 'user', args: 1 }
});
const file = `../Twitter/${cmd.from}.md`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
if (!fs.existsSync(dirImage)) {
  fs.mkdirSync(dirImage);
}
fs.writeFile(file, "", (err) => {
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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const subtractDay = dayjs(cmd.from).subtract(1, 'day').format('YYYY-MM-DD'); // Get UTC15:00-24:00 
  await page.goto(`https://nitter.it/${cmd.user}/search?f=tweets&q=&since=${subtractDay}&until=${cmd.to}`);
  await page.exposeFunction("formatDate", formatDate);
  await page.exposeFunction("downloadImage", downloadImage);

  while (true) {
    const result = await page.evaluate(async (fromDate) => {
      const getUserNameContent = (element) => {
        const fullName = element.querySelector(".fullname").innerText;
        const username = element.querySelector(".username");
        return `[${fullName} ${username.innerText}](https://twitter.com${username?.getAttribute("href")})`;
      }
      const getPostContent = async (element, postNumber, action) => {
        let data = '';
        const contentClass = action === 'tweet' ? '.tweet-content' : '.quote-text';
        const quoteText = action === 'tweet' ? '' : '> ';
        const link = element.querySelector(`.${action}-link`);
        const date = element.querySelector(".tweet-date a")?.getAttribute("title");
        const content = element.querySelector(contentClass)?.innerHTML;
        const isRetweet = element.querySelector(".retweet-header");
        const isReply = element.querySelector(".replying-to a");
        const isImage = element.querySelectorAll(`${action === 'tweet' ? contentClass + ' + ' : ''}.attachments .attachment`);
        const isQuote = element.querySelector(".quote");
        let dateFormat = await formatDate(date.toString());
        if (dateFormat[1] != fromDate && action === 'tweet') return ''; // Skip Post
        
        data += action === 'tweet' ? '' : `${quoteText}${getUserNameContent(element)}  \n`;
        data += `${quoteText}[${dateFormat[0]}](${link?.toString().replaceAll('https://nitter.it/', 'https://twitter.com/')})  \n`;
        if (isRetweet) {
          data += `${quoteText}Retweet from ${getUserNameContent(element.querySelector(".tweet-header"))}  \n\n`;
        }
        if (isReply) {
          data += `${quoteText}Replying to [${isReply.innerText}](https://twitter.com${isReply?.getAttribute("href")})  \n\n`;
        }
        data += `${quoteText}${action === 'tweet' ? content : content.replaceAll('\n','\n>')}  \n`;
        if (isQuote) {
          data += await getPostContent(isQuote, `${postNumber}-quote`, 'quote');
        }
        if (isImage) {
          for (let [index, element] of isImage.entries()) {
            await downloadImage(`https://nitter.it${element.querySelector('img')?.getAttribute("src")}`, `../Twitter/images/${fromDate}-${postNumber}-${index}.png`);
            data += `${quoteText}![image](images/${fromDate}-${postNumber}-${index}.png)  \n`;
          }
        }
        if (action === 'tweet') {
          data += `\n---\n\n`;
        }
        return data;
      }

      const elements = document.querySelectorAll(".timeline-item:not(.show-more)");
      let data = '';
      for (let [index, element] of elements.entries()) {
        data += await getPostContent(element, index, 'tweet');
      }
      return data;
    }, cmd.from);

    fs.appendFile(file, result, (err) => {
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
      if (data === '') fs.unlinkSync(file);
      break;
    }
  }
  await browser.close();
})();
