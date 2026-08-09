# DKY Tools

DKY Tools 是一個多站點工具與學習內容儲存庫。各站點以獨立目錄部署；公開網站不使用儲存庫根目錄作為建置輸出。

## 公開網站

| 網站 | 原始碼目錄 | 目前功能 |
| --- | --- | --- |
| [tools.dky.tw](https://tools.dky.tw) | `dky_tw/` | 開發、文字、設計、媒體與換算工具 |
| [use.dky.tw](https://use.dky.tw) | `dky_use/` | IDEA Box 提案產生器、美股投資組合追蹤 |
| [learn.dky.tw](https://learn.dky.tw) | `dky_learn/` | 統計學習、AI Agent 與技術研究文章 |
| [pdfdata.dky.tw](https://pdfdata.dky.tw) | `pdfdata/` | 加密 PDF 解密與內嵌附件提取 |

## DKY 工具箱

`dky_tw/` 目前提供以下功能：

- 開發與編碼：QR Code、JSON 格式化、Base64、JWT 解碼、網址編解碼、SHA-1／SHA-256／SHA-512、Regex 測試、CSS Box Shadow。
- 文字與設計：文字統計／大小寫／去除頭尾空白、文字與 PDF 差異比對、HEX／RGB／HSL／CMYK 色碼轉換。
- 換算與產生：時區換算、即時匯率、強密碼、台灣身分證字號產生與驗證、長度／重量／溫度／面積／速度換算。
- 媒體處理：圖片批次壓縮、影片壓縮、影片轉 GIF。
- PDF 入口：連至 `pdfdata.dky.tw` 提取 PDF 內嵌附件；`/pdf` 亦會重新導向該站。

## DKY 私人工作台

`dky_use/` 是有密碼保護的私人工作台，目前包含：

- IDEA Box：透過 Cloudflare Pages Function 呼叫 Gemini，產生決策分析與提案內容，支援複製純文字及下載 Word。
- 美股投資組合：多帳戶買入、賣出與配息紀錄，計算已實現／未實現損益，透過 Yahoo Finance 代理更新股價，支援 CSV 匯入與匯出。
- 投資組合狀態以瀏覽器 `localStorage` 保存，並可透過 Cloudflare D1／KV 同步。

## DKY 學習中心

`dky_learn/` 是靜態學習網站，內容包含：

- ISLP 統計學習與機器學習課程。
- AI Agent 系列課程。
- LLM、RAG、Agent 記憶與相關研究筆記。

## PDF 附件提取

`pdfdata/` 使用 PDF.js 在瀏覽器內處理 PDF，可輸入開啟密碼並下載 PDF 內嵌附件。PDF 檔案與密碼不會上傳至應用程式伺服器。

## 資料處理說明

- 檔案壓縮、轉檔、文字處理及 PDF 附件提取主要在瀏覽器端完成。
- 部分工具會從 CDN 載入前端函式庫。
- 即時匯率會呼叫外部匯率 API。
- IDEA Box 會將表單內容送至 Cloudflare Pages Function，再由後端呼叫 Gemini。
- 美股工具會透過 Pages Function 讀取 Yahoo Finance，並使用 D1／KV 儲存同步狀態。

因此，本儲存庫不是所有功能皆可完全離線，也不是所有資料都只存在瀏覽器。

## 目錄結構

```text
dky_tw/        公開開發者工具箱
dky_use/       私人工作台與 Pages Functions
dky_learn/     學習課程與研究文章
pdfdata/       PDF 附件提取靜態站
pdf/           自架 Stirling PDF／OCI 部署相關檔案
hermes-proxy/  Hermes 備援代理
docs/          部署與維運文件
tests/         PDF buffer 回歸測試
```

`pdf/` 保留自架 Stirling PDF 的部署程式與文件，但目前不列為上述公開工具站的可用功能。

## 部署

Cloudflare Pages 專案對應如下：

| Pages 專案 | Root directory | 網域 |
| --- | --- | --- |
| `dky-tools` | `dky_tw` | `tools.dky.tw` |
| `dky-use` | `dky_use` | `use.dky.tw` |
| `dky-learn` | `dky_learn` | `learn.dky.tw` |
| `pdfdata` | `pdfdata` | `pdfdata.dky.tw` |

三個 Git 整合站點皆不需要 Build command；Cloudflare 直接部署對應目錄，其中 `dky_use` 同時包含 Pages Functions。`pdfdata` 目前使用 Direct Upload，正式部署命令：

```bash
npx wrangler pages deploy ./pdfdata --project-name pdfdata --branch pdfdata
```

### dky_use 環境設定

IDEA Box：

- `GEMINI_API_KEY`：必填。
- `GEMINI_MODEL`、`GEMINI_MAX_OUTPUT_TOKENS`、`GEMINI_TIMEOUT_MS`、`ALLOWED_ORIGIN`：選填。

美股狀態同步：

- `STOCK_DB`：Cloudflare D1 binding，主要儲存空間。
- `STOCK_KV`：選填的 KV binding，供舊資料移轉與備援鏡像。
- `API_TOKEN`：前後端同步 API 驗證權杖。

D1 schema 位於 `dky_use/migrations/0001_stock_state.sql`。

## 測試

PDF 密碼重試與 detached ArrayBuffer 回歸測試：

```bash
node --experimental-default-type=module --test tests/*.test.mjs
```

## 作者與版權

© 2026 DKY.tw
