const puppeteer = require("puppeteer");
const fs = require("fs");
const stdio = require('stdio');
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const dir = "./src";
const cmd = stdio.getopt({
  'from': {key: 'from', description: 'from', args: 1},
  'to': {key: 'to', description: 'to', args: 1},
  'user': {key: 'to', description: 'user', args: 1}
});
const ouptputCSV = `./src/${cmd.from}.md`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

fs.writeFile(ouptputCSV, "", (err) => {
  if (err) throw err;
});

const formatDate = (date) => {
  return dayjs(date.replace(' · ',' ')).tz('Asia/Tokyo').format('D MMM, YYYY hh:mm:ss A');
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://nitter.it/${cmd.user}/search?f=tweets&q=&since=${cmd.from}&until=${cmd.to}`);
  await page.exposeFunction("formatDate", formatDate);

  while (true) {
    const result = await page.evaluate(async () => {
      const elements = document.querySelectorAll(".timeline-item:not(.show-more)");
      let data = '';
      for (let element of elements) {
        const isRetweet = element.querySelector(".retweet-header");
        const link = element.querySelector(".tweet-link");
        const date = element.querySelector(".tweet-date a")?.getAttribute("title");
        const content = element.querySelector(".tweet-content")?.innerHTML;
        const image = element.querySelector(".attachment img")?.getAttribute("src");
        data += `[${await formatDate(date.toString())}](${link.toString().replaceAll('https://nitter.it/','https://twitter.com/')})  \n`;
        if (isRetweet) {
          const fullName = element.querySelector(".fullname-and-username .fullname").innerText;
          const username = element.querySelector(".fullname-and-username .username");
          data += `Retweeted [${fullName} ${username.innerText}](${username})  \n\n`;
        }
        data += `${content}  \n`;
        if (image) data += `![image](https://nitter.it${image})  \n`;
        data += `\n---\n\n`;
      }
      return data;
    });

    fs.appendFile(ouptputCSV, result, (err) => {
      if (err) throw err;
    });

    const [buttonSelector] = await page.$x("//a[contains(., 'Load more')]")
    if (buttonSelector) {
      await Promise.all([
        page.waitForNavigation(),
        buttonSelector.click(),
      ]);
    } else {
      break;
    }
  }
  await browser.close();
})();
