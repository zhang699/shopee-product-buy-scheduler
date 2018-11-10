const puppeteer = require("puppeteer");
class PupteerWrapper {
  async start({ headless = false } = {}) {
    const b =
      this.browser ||
      (await puppeteer.launch({
        headless
      }));

    this.browser = b;
    return this.browser.wsEndpoint();
  }

  async goTo(url) {
    const pages = await this.browser.pages();
    const page =
      pages.length > 0 && !pages[0].url()
        ? pages[0]
        : await this.browser.newPage();
    const width = 1980;
    const height = 1080;
    page.setViewport({ width, height });
    await page.goto(url);
    this.page = page;
    return page;
  }

  getBrowser() {
    return this.browser;
  }

  getCurrentPage() {
    return this.page;
  }

  async connect(browserUrl) {
    this.browser = await puppeteer.connect({
      browserWSEndpoint: b._connection._url, //`ws://${host}:${port}/devtools/browser/<id>`,
      ignoreHTTPSErrors: false
    });
  }
}
module.exports = PupteerWrapper;
