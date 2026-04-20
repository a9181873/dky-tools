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
*   **📱 QR Code 生產器 (QR Code Generator)**
    無廣告、無浮水印，輸入網址立即產出高解析度的 Canvas 畫布，支援下載成純淨 PNG。

## 🚀 部署架構 (Deployment)

1.  **純靜態架構**：不依賴任何 Node.js 後端或資料庫。
2.  **邊緣網路**：針對 Cloudflare Pages 最佳化設計，建議設定 `dky_tw` 作為建置根目錄 (Root directory)。
3.  **無伺服器費用**：流量與算力成本幾乎為零，適合長期永續營運的技術入口網域。

## 👨‍💻 作者與版權
© 2026 DKY.tw — All operations are running locally. 