const puppeteer = require("puppeteer");

const USERNAME = "<secret></secret>";
const PASSWORD = "<secret></secret>";

(async () => {
  const width = 1920;
  const height = 1080;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width, height });
  await page.goto("https://shopee.tw/");
  await page.waitFor(1000);

  puppeteer.
  // to skip ads
  await page.click("body");

  await page.screenshot({ path: "before-click-login-button.png" });

  await page.waitFor(1000);
  const links = await page.$x("//li[contains(text(), '登入')]");
  links[0].click();
  // wait for login dialog popup
  await page.waitForSelector(".shopee-authen--login");

  //const links = await page.$x("//inpit[contains(text(), )");
  const [username, password] = await page.$$(".shopee-authen--login input");

  await username.type(USERNAME);

  await password.type(PASSWORD);

  const [ignoreButton, cancelButton, loginButton] = await page.$$(
    ".shopee-authen--login button"
  );

  loginButton.click();

  await page.waitFor(1000);
  await page.screenshot({ path: "in-verification.png" });

  //shopee-authen__container
  const verificationCode = await page.$$(".shopee-authen__container input");

  await browser.close();
})();
