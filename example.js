const puppeteer = require('puppeteer');

(async () => {
    // const browser = await puppeteer.launch();
    const args = puppeteer.defaultArgs().filter(arg => String(arg).toLowerCase() !== '--disable-extensions');
    const pathToExtension = require('path').join(__dirname, 'rakuten_extension.crx');
    console.log(pathToExtension);
    const browser = await puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: true,
        args: args.concat([
            '--remote-debugging-port=9223',
            `--load-extension=${pathToExtension}`
        ])
    });

    const page = await browser.newPage();
    await page.goto('https://grp03.id.rakuten.co.jp/rms/nid/login?service_id=r12&return_url=login?tool_id=1&tp=&id=');
    await page.waitForSelector('#loginInner_u');
    await page.screenshot({ path: './screenshot/example.png' });

    await browser.close();
})();