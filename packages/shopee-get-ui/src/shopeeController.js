const PupteerWrapper = require("./pupteerWrapper");
const EventEmitter = require("events");
const Scheduler = require("./schedule");
const fs = require("fs");
const URL = "https://shopee.tw";
const COOKIE_PATH = "./cookie";
const WAIT_TIMEOUT = 60 * 1000 * 60; // 1hr
const SPEC_SELCTOR = ".product-briefing .product-variation";
const { rpc, rpc_process } = require("carlo/rpc");

class ShopeeController extends EventEmitter {
  constructor() {
    super();
    this.puppeteer = new PupteerWrapper();
    this.scheduler = new Scheduler();
    this.scheduler.loadSchedule(this);
  }

  async click(page, selector, { wait = true } = {}) {
    if (wait) {
      await page.waitForSelector(selector);
    }
    const target = await page.$(selector);
    await target.click();
  }

  notifyScheduleProgress(bundle) {
    // make sure button click cause page transition
    this.emit("schedule", bundle);
  }
  async execute(schedule) {
    await this.puppeteer.start({ headless: true, multiple: false });

    await this.goTo(schedule.url);
    try {
      await this.waitForAccount(1000);
    } catch (e) {
      console.error("no account goto setup");
      if (!this.checkCookie()) {
        return this.emit("data", {
          name: "needCookieToContinue",
          cookie: null
        });
      }
    }

    const page = this.puppeteer.getCurrentPage();
    this.notifyScheduleProgress({
      name: "startAddToCart",
      target: { ...schedule }
    });
    //const productSpecs = await page.$$(".product-briefing .product-variation");
    if (schedule.specname) {
      this.notifyScheduleProgress({
        name: "selectSpec",
        target: { ...schedule }
      });
      await page.waitForSelector(SPEC_SELCTOR);
      const [specButton] = await page.$x(
        `//button[contains(text(), '${schedule.specname}')]`
      );
      await specButton.click();
    }

    const buyButton = await page.$(".product-briefing .btn-solid-primary");
    await buyButton.click();

    // make sure button click cause page transition
    this.notifyScheduleProgress({
      name: "addedToCart",
      target: { ...schedule }
    });

    //.toast

    await this.click(page, ".cart-page-footer__checkout-text", {
      wait: true
    });

    await this.click(page, ".cart-page-footer__checkout-text", {
      wait: true
    });

    this.notifyScheduleProgress({
      name: "madeTransaction",
      target: { ...schedule }
    });
    await this.click(page, ".page-checkout__payment-order-wrapper button", {
      wait: true
    });
    await page.waitForSelector(".loading-spinner-popup__container", {
      hidden: true
    });
    await this.click(page, ".page-checkout__payment-order-wrapper button", {
      wait: false
    });
    this.notifyScheduleProgress({
      name: "confirmTransaction",
      target: { ...schedule }
    });
  }

  async checkCookie(cookiePath = COOKIE_PATH) {
    let cookie;
    const page = this.puppeteer.getCurrentPage();
    if (fs.existsSync(cookiePath)) {
      cookie = await fs.readFileSync("./cookie", { encoding: "utf-8" });
      page.setCookie(...JSON.parse(cookie));
      await page.reload();
      return true;
    } else {
      this.emit("data", { name: "waitForAccountInput", cookie: null });
      return false;
    }
  }
  async start(url = URL) {
    await this.puppeteer.start();
    const page = await this.goTo(url);

    const containCookie = await this.checkCookie();

    await this.waitForAccount();

    const shopeeCookie = await this.puppeteer.getCurrentPage().cookies();

    fs.writeFileSync("./cookie", JSON.stringify(shopeeCookie));

    this.emit("data", { name: "detectAccount", cookie: shopeeCookie });

    this.emit("data", {
      name: "detectProduct",
      productname: ""
    });
    const specs = await this.listSpecs();

    if (specs.length > 0) {
      this.emit("data", { name: "detectSpecs", specs });
    }

    //.product-briefing
  }

  async getScheduler() {
    return rpc.handle(this.scheduler);
  }
  async goTo(url) {
    return this.puppeteer.goTo(url);
  }
  async getCookie() {
    return this.puppeteer.getCurrentPage().cookies();
  }

  async confirmSpec(text) {}

  async getProduct() {
    const product = await this.puppeteer
      .getCurrentPage()
      .$$(".product-briefing ");
    return p;
  }
  async listSpecs() {
    // product-variation
    const productSpecs = await this.puppeteer.getCurrentPage().$$(SPEC_SELCTOR);

    const resultSpecs = [];
    for (const spec of productSpecs) {
      /* come from here, https://github.com/GoogleChrome/puppeteer/issues/1341 */
      const text = await (await spec.getProperty("textContent")).jsonValue();
      resultSpecs.push({
        text
      });
    }
    return resultSpecs;
  }

  async waitForAccount(timeout = WAIT_TIMEOUT) {
    return this.puppeteer
      .getCurrentPage()
      .waitForSelector(".navbar__link--account__container", {
        timeout: timeout
      });
  }
}

//rpc_process.init(() => rpc.handle(new ShopeeController()));
module.exports = new ShopeeController();
