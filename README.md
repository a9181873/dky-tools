# 🛠️ DKY.tw 開發者工具箱 (Developer Toolbox)

這是一款專為前端開發者與設計師打造的**純客戶端**、**高效能**且**極簡優雅 (深川製磁風格)** 的線上工具集合。

所有運算皆於使用者的瀏覽器端 (Client-side) 完成，不儲存任何資料，無隱私疑慮，且支援 Offline 離線存取能力 (Service Worker PWA)。

## ✨ 核心特色功能 (Features)

*   **🔑 JWT 解碼 (JWT Parser)**
    在本地端瞬間解析 JSON Web Token (JWT)，確保包含機密資訊的 Token 絕不會上傳到第三方伺服器。
*   **🛡️ 強密碼產生器 (Password Generator)**
    調用瀏覽器原生的硬體級亂數 `window.crypto.getRandomValues()`，即時生成 8~128 字元的超強高安全性密碼。
*   **🔗 網址編解碼 (URL Encode / Decode)**
    解決惱人的 `%E6` 等亂碼網址，快速進行 `encodeURIComponent` 與反向解碼驗證。
*   **📝 進階文字處理 (Text Utilities)**
    包含中英文字數統計 (含空白/去空白)、一鍵全大寫/全小寫轉換，以及去除頭尾空白的快速排版小幫手。
*   **🌍 跨國時區即時轉換 (Timezone Converter)**
    利用 `Intl.DateTimeFormat` 精準計算日本東京、美國紐約、英國倫敦、台灣台北及世界協調時間 (UTC) 等當地時間。
*   **🎨 顏色代碼互轉 (Color Converter)**
    HEX、RGB、HSL 以及印刷用 CMYK 的即時數學換算引擎與即時色彩檢視窗。
*   **{} JSON 格式檢查與排版 (JSON Formatter)**
    瞬間揪出被壓縮過或是巢狀結構極深的 JSON 錯誤，並自動美化排版 (Beautify)。
*   **📦 Base64 檔案編解碼器 (Base64 Encode/Decode)**
    支援文字或直接將「任何檔案 (圖片、文件)」拖曳轉換為純文字的 Base64 Data URI，也能無損解碼回原本檔案。
*   **⚖️ 文字內容比對 (Diff)**
    輕量級的程式碼 / 文本行對比工具，瞬間掌握內容的增減差異。
*   **🧰 PDF 進階工具 (Stirling PDF)**
    導向自架 Stirling PDF (`https://pdf.dky.tw`)，支援 OCR、壓縮、合併、分割、擷取頁面、轉 Word、轉文字與 Hermes 自動化。
*   **📱 QR Code 生產器 (QR Code Generator)**
    無廣告、無浮水印，輸入網址立即產出高解析度的 Canvas 畫布，支援下載成純淨 PNG。

## 🚀 部署架構 (Deployment)

1.  **靜態工具箱 + Pages Function**：大多數工具仍是純前端本機運算；IDEA Box 透過 Cloudflare Pages Function 代理 AI API，避免 API Key 暴露在瀏覽器。
2.  **PDF 進階入口**：PDF 大型處理交給 OCI 上的 Stirling PDF，`/pdf` 會重新導向 `https://pdf.dky.tw`。
3.  **邊緣網路**：針對 Cloudflare Pages 最佳化設計，建議設定 `dky_tw` 作為建置根目錄 (Root directory)。
4.  **無資料庫架構**：不儲存提案內容，瀏覽器送出後由 Pages Function 即時呼叫模型並回傳。

### PDF 進階工具

`dky_tw` 不再提供重複的陽春 PDF 工具箱入口；首頁與導覽列保留「PDF 進階」，連到 `https://pdf.dky.tw`。

可用能力：

* OCR：繁中 `chi_tra` + 英文 `eng`
* 壓縮 PDF
* 合併與分割 PDF
* 擷取指定頁面
* PDF 轉文字
* PDF 轉 Word
* Hermes 自動化批次處理

舊路徑：

```text
/pdf -> https://pdf.dky.tw
```

完整文件：

```text
../docs/stirling-pdf-hermes.md
```

### Cloudflare Pages 設定

建議設定：

* Root directory：`dky_tw`
* Build command：留空
* Build output directory：`/`
* Functions directory：使用預設 `functions`

### API Key 設定

IDEA Box 需要在 Cloudflare Pages 的 Variables and Secrets 設定 Secret：

* `GEMINI_API_KEY`：必填，Gemini API Key
* `GEMINI_MODEL`：選填，預設使用 `gemini-2.5-flash`
* `GEMINI_MAX_OUTPUT_TOKENS`：選填，預設 `4096`，可控制單次生成上限與成本
* `GEMINI_TIMEOUT_MS`：選填，預設 `25000`，避免 API 等太久
* `ALLOWED_ORIGIN`：選填，例如 `https://dky.tw`，限制只有指定來源網域可呼叫 API；多個網域可用逗號分隔

可用 Wrangler 設定：

```bash
npx wrangler pages secret put GEMINI_API_KEY --project-name <你的 Cloudflare Pages 專案名稱>
```

本機測試 Pages Function 時，請在 `dky_tw/.dev.vars` 放入：

```dotenv
GEMINI_API_KEY="你的 Gemini API Key"
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_MAX_OUTPUT_TOKENS="4096"
GEMINI_TIMEOUT_MS="25000"
ALLOWED_ORIGIN="http://localhost:8788"
```

`.dev.vars`、`.env` 不要提交到 GitHub。

### 成本與濫用控制

目前 IDEA Box API 已有基本護欄：

* 構想說明最多取前 4000 字，避免超長輸入吃掉大量 token。
* 模型輸出預設最多 4096 tokens。
* Gemini API 超過 25 秒會中止。
* 可設定 `ALLOWED_ORIGIN` 限制可呼叫來源。

正式公開後仍建議在 Google AI Studio / Google Cloud 設定預算提醒，並視流量加上 Cloudflare WAF / Rate Limiting 或 Turnstile。

## 👨‍💻 作者與版權
© 2026 DKY.tw — All operations are running locally. 
