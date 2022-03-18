const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class RakutenSearch {
    constructor(page) {
        this.page = page;
        const settingsString = fs.readFileSync('settings.json');
        this.settings = JSON.parse(settingsString);
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

    await page.screenshot({ path: './screenshot/example.png' });

    await browser.close();
})();
