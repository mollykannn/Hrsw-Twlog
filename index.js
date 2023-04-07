const puppeteer = require("puppeteer");
const fs = require("fs");
const client = require('https');
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
const file = `./src/${cmd.from}.md`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
if (!fs.existsSync('./src/images')) {
  fs.mkdirSync('./src/images');
}

fs.writeFile(file, "", (err) => {
  if (err) throw err;
});

const formatDate = (date) => {
  return dayjs(date.replace(' · ',' ')).tz('Asia/Tokyo').format('D MMM, YYYY hh:mm A');
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
      client.get(url, (res) => {
          if (res.statusCode === 200) {
              res.pipe(fs.createWriteStream(filepath))
                  .on('error', reject)
                  .once('close', () => resolve(filepath));
          } else {
              // Consume response data to free up memory
              res.resume();
              reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

          }
      });
  });
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://nitter.it/${cmd.user}/search?f=tweets&q=&since=${cmd.from}&until=${cmd.to}`);
  await page.exposeFunction("formatDate", formatDate);
  await page.exposeFunction("downloadImage", downloadImage);

  while (true) {
    const result = await page.evaluate(async (fromDate) => {
      const elements = document.querySelectorAll(".timeline-item:not(.show-more)");
      let data = '';
      for (let [index, element] of elements.entries()) {
        const isRetweet = element.querySelector(".retweet-header");
        const link = element.querySelector(".tweet-link");
        const date = element.querySelector(".tweet-date a")?.getAttribute("title");
        const content = element.querySelector(".tweet-content")?.innerHTML;
        const image = element.querySelector(".attachment img")?.getAttribute("src");
        let dateFormat = await formatDate(date.toString());
        data += `[${dateFormat}](${link.toString().replaceAll('https://nitter.it/','https://twitter.com/')})  \n`;
        if (isRetweet) {
          const fullName = element.querySelector(".fullname-and-username .fullname").innerText;
          const username = element.querySelector(".fullname-and-username .username");
          data += `Retweeted [${fullName} ${username.innerText}](https://twitter.com${username?.getAttribute("href")})  \n\n`;
        }
        data += `${content}  \n`;
        if (image) {
          await downloadImage(`https://nitter.it${image}`, `src/images/${fromDate}-${index}.png`);
          data += `![image](images/${fromDate}-${index}.png)  \n`;
        }
        data += `\n---\n\n`;
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
      break;
    }
  }
  await browser.close();
})();
