/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class RakutenSearch {
    constructor(page) {
        this.page = page;
        const settingsRaw = fs.readFileSync('settings.json');
        this.settings = JSON.parse(settingsRaw.toString());
        const keywordsRaw = fs.readFileSync('keywords.json');
        this.keywords = JSON.parse(keywordsRaw.toString());
    }

    async loginPage() {
        await this.page.goto('https://grp03.id.rakuten.co.jp/rms/nid/login?service_id=r12&return_url=login?tool_id=1&tp=&id=');
        await this.page.waitForSelector('#loginInner_u');
    }

    async login() {
        await this.page.type('#loginInner_u', this.settings.account, { delay: 20 });
        await this.page.type('#loginInner_p', this.settings.password, { delay: 20 });
        await this.page.click('input[name="submit"]');
        await this.page.waitForSelector('#search-input');
    }

    async search() {
        await this.page.type('#search-input', this.randomKeywords(), { delay: 20 });
        await this.page.click('#search-submit');
        await this.page.waitForSelector('#srchformtxt_qt');
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await new Promise((r) => setTimeout(r, 2000));
            const counter = await this.page.waitForSelector('.KuchisuBar-module__progressCounter1__1NVVE');
            const counterText = await this.page.evaluate((el) => el.textContent, counter);
            console.log(`Search count: ${counterText}`);

            if (parseInt(counterText, 10) < 30) {
                const input = await this.page.waitForSelector('#srchformtxt_qt');
                await this.page.evaluate((el) => el.value = '', input);
                await this.page.type('#srchformtxt_qt', this.randomKeywords(), { delay: 20 });
                await this.page.click('#searchBtn');
                await this.page.waitForSelector('#srchformtxt_qt');
            } else {
                break;
            }
        }
    }

    randomKeywords() {
        const random = Math.floor(Math.random() * this.keywords.keywords.length);
        return this.keywords.keywords[random];
    }
}

(async () => {
    const args = puppeteer.defaultArgs().filter((arg) => String(arg).toLowerCase() !== '--disable-extensions');
    const pathToExtension = path.join(__dirname, 'rakuten_extension.crx');
    const browser = await puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: true,
        args: args.concat([
            '--remote-debugging-port=9223',
            `--load-extension=${pathToExtension}`,
        ]),
    });

    const page = await browser.newPage();
    const rakutenSearch = new RakutenSearch(page);
    await rakutenSearch.loginPage();
    await rakutenSearch.login();
    await rakutenSearch.search();

    await page.screenshot({ path: './screenshot/example.png' });

    await browser.close();
})();
