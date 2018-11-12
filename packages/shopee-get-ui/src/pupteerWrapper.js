const puppeteer = require("puppeteer");
const path = require("path");
const isWin = process.platform === "win32";
const isPkg = typeof process.pkg !== "undefined";
/** https://github.com/zeit/pkg/issues/204#issuecomment-410728205 */
const replaceRegex = isWin
  ? /^.*?\\node_modules\\puppeteer\\\.local-chromium/
  : /^.*?\/node_modules\/puppeteer\/\.local-chromium/;
const chromiumExecutablePath = isPkg
  ? puppeteer
      .executablePath()
      .replace(
        replaceRegex,
        path.join(path.dirname(process.execPath), "chromium")
      )
  : puppeteer.executablePath();

class PupteerWrapper {
  constructor() {
    this.browserList = [];
  }
  async start({ headless = false, multiple = false } = {}) {
    const b =
      this.browser && !multiple
        ? this.browser
        : await puppeteer.launch({
            executablePath: chromiumExecutablePath,
            headless,
            args: ["--disable-dev-shm-usage"]
          });

    this.browser = b;
    this.browserList.push(b);
    return this.browser.wsEndpoint();
  }
  async close() {
    try {
      for (const browser of this.browserList) {
        await browser.close();
        await browser.process().kill();
      }
      this.browserList = [];
      this.browser = null;
    } catch (e) {
      console.warn(e);
    }
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
