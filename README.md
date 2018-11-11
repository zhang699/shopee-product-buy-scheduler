## Introduction

- 設定排程時間來執行 Shopee 購買商品的動作，用來省去人工購買商品的時間與操作

### Screenshot

<img src="https://i.imgur.com/DUGZ7Se.png" alt="alt text" width="300" height="whatever">

## Usage

### Tell your product and login

- Step1: 貼上要執行產品 URL，點選`直接開始`
- Step2: 選澤產品規格，讓系統記錄下來
- Step3: 設定排程日期與時間，可以設定至秒 (YYYY-MM-DDT:hh:mm:ss)

[設定商品 URL、紀錄 Cookie 與指定時間](https://www.youtube.com/watch?v=FO9I0xfKKqM)

### Execute manually

[手動執行排程](https://youtu.be/6CKyQ3hVCTs)

### Development

> cd ./packages/shopee-get-ui && yarn

> node index.js

### Notice

- 開發目前只在 MAC OS Mojave 上用過
- 使用者操作 chromium 登入後會將 browser's cookie 存成檔名為 `cookie` 檔案
- Chromium 有 `headerless=true` (不開啟 browser 背景執行)，`headerless=false` 開啟 browser ui 進行動作

- 目前在`Tell your product and login` 中使用 headerless=false，讓 使用者 可以操作 browser 進行登入
- 在`Execute manually` 或 schedule execute 中 不開啟 browser，來達到快速執行的目的，但缺點是使用者無法中途介入操作

### TODOs

- [ ] 增加`小米`網站的支援
- [ ] 打包成各平台的 distribution (windows/mac)
- [ ] 介面上增加`headless`與否的選項，區分人在與不在電腦前的兩種使用情境
- [ ] Solve known issues ..
- [ ] 執行期間的 log

### Known Issues

- 開啟 browser 的操作，似乎沒有非常快速，可能是 `waitForXXX` 的原因
- 有時即便倒入 cookie 後 還會要求使用者登入
- 一分鐘內秒殺的商品很常出現 `Timeout Error` 與 `Execution Context was destoyed`
  前者可能是找不到 `下訂單`的按扭，或是點選`直接購買`沒有反應
  (按鈕為 disabled)

  > `TimeoutError: waiting for selector ".cart-page-footer__checkout-text" failed: timeout 30000ms exceeded`

  > `Error: Execution context was destroyed, most likely because of a navigation

- Used Libraries

  [node-cron 用在排程任務](https://github.com/kelektiv/node-cron)

  [carlo 提供 nodejs GUI 的 Framework](https://github.com/GoogleChromeLabs/carlo)

  [puppteer UI 測試的自動化框架 用在操作 browser](https://github.com/GoogleChrome/puppeteer)

  [lowdb 記錄排成資料的輕便 db](https://github.com/typicode/lowdb)
