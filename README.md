# 🛠️ DKY.tw 開發者工具箱 (Developer Toolbox)

這是一款專為前端開發者、設計師與辦公人員打造的 **純客戶端 (Client-side)**、**高效能** 且 **極簡優雅 (Cyber-Dark 暗色毛玻璃風格)** 的線上工具集合。

所有運算皆於使用者的瀏覽器端完成，不儲存任何資料，無隱私疑慮，且支援 Offline 離線存取能力 (Service Worker PWA)。

---

## ✨ 核心特色工具詳細說明 (Complete Feature List)

### 1. 📎 PDF 附件提取工具 (`/pdfextract`) — *NEW!*
- **加密解密**：上傳受密碼保護的 PDF，自動跳出提示並完成解密。
- **雙重抽取**：完整讀取 Catalog 級別內嵌附件與 Page 級別 FileAttachment 註解，支援 ZIP、Excel (.xlsx/.csv)、圖片、文件等格式。
- **打包下載**：支援單檔點擊下載，或使用 JSZip 一鍵打包下載全部附件（`extracted_attachments.zip`）。
- **15 小時銷毀與隱私**：內建 15 小時倒數自動銷毀機制，並提供「立即清除」按鈕。100% 純瀏覽器本機運算，檔案與密碼絕不上傳伺服器。

### 2. 📱 QR Code 產生器 (`/qr`)
- 輸入任意網址或文字，立刻生成無廣告、無浮水印的高解析度 QR Code Canvas 畫布。
- 支援一鍵下載為高畫質 PNG 圖片，適合店家、活動或行銷使用。

### 3. {} JSON 格式檢查與排版 (`/json`)
- 瞬間將單行壓縮或巢狀混亂的 JSON 字串排版為語法高亮、帶縮排的綺麗格式。
- 自動揪出未閉合括號、缺少引號或格式錯誤的位置並給予提示。

### 4. 🎨 顏色代碼轉換 (`/color`)
- HEX (#00F2FF)、RGB (r, g, b) 與 HSL 的即時數學換算。
- 內建色塊即時預覽視窗與即時輸入連動（Input Binding）。

### 5. 📦 Base64 檔案編解碼器 (`/base64`)
- **文字編解碼**：將文字快速進行 Base64 UTF-8 編碼與反向解碼。
- **檔案轉換**：支援將圖片、PDF、文件直接拖曳轉換為 Data URI 字串；亦可將 Base64 字串無損還原下載回原本檔案。

### 6. ⚖️ 文字 / PDF 差異比對 (`/diff`)
- **文字比對**：提供逐行 (Lines) 與逐字 (Words) 差異對比，清晰標示新增（綠色）與刪除（紅色）。
- **PDF 比對**：在瀏覽器中直接提取兩份 PDF 文件文字並進行內容比對，合約與保險條款修改一目瞭然。

### 7. 🔑 JWT Token 解密 (`/jwt`)
- 瞬間解析 JSON Web Token (JWT) 的 Header 與 Payload 資料。
- 自動轉換過期時間 (exp) 與簽發時間 (iat) 為易讀的日期格式，純本地運算保護 Token 隱私。

### 8. 🛡️ 強密碼產生器 (`/pwd`)
- 調用瀏覽器原生的硬體級亂數 `window.crypto.getRandomValues()`。
- 支援 8~128 字元長度設定，即時生成駭客無法預測的高強度隨機密碼。

### 9. 🔗 網址編解碼 (`/url`)
- 解決中文網址複製後變成 `%E6%B8%AC` 惱人亂碼的問題。
- 一鍵完成 `encodeURIComponent` 與 `decodeURIComponent` 雙向轉換。

### 10. 📝 文字排版助手 (`/text`)
- **字數統計**：即時計算字數（含空白）、字數（去空白）、行數與段落數。
- **格式轉換**：提供一鍵英文全大寫 (UPPERCASE)、全小寫 (lowercase) 及去頭尾空白 (Trim) 功能。

### 11. 🌍 跨國時區即時轉換 (`/tz`)
- 提供全球 50+ 主要城市（東京、紐約、倫敦、巴黎、雪梨、台北等）與 UTC 時間即時換算。
- 支援中英文城市關鍵字搜尋與跳秒時鐘即時顯示。

### 12. 💱 即時匯率換算 (`/fx`)
- 串接國際開源匯率 API，提供美金 (USD)、台幣 (TWD)、日圓 (JPY)、歐元 (EUR) 等全球主要貨幣轉換。
- 自動計算模擬買賣價差與匯率中間價參考。

### 13. 🔒 加密雜湊計算 (`/hash`)
- 提供 SHA-1、SHA-256、SHA-384、SHA-512 不可逆 Hash 雜湊計算。
- 100% 瀏覽器端計算，適用於密碼校驗與檔案指紋比對。

### 14. ✨ CSS 視覺產生器 (`/css`)
- 拖動 X、Y、Blur、Spread 等滑桿，即時在畫面上預覽 CSS `box-shadow` 立體陰影效果。
- 滿意後一鍵複製語法直接貼至前端專案。

### 15. 🔎 正規表達式測試器 (`/regex`)
- 輸入 Regex Pattern (如 Email、手機號碼配對)，在測試文本中即時高亮標示配對結果。

### 16. 🪪 台灣身分證字號產生與驗證 (`/id`)
- **產生器**：依照內政部數學校驗邏輯，可指定縣市、性別生成測試用字號（僅供開發測試使用）。
- **驗證器**：即時校驗現有字號格式與數學邏輯是否合法。

### 17. 📐 單位換算器 (`/unit`)
- 長度、重量、溫度、面積、速度等 5 大類常用單位即時連動換算（例如：公里/英里、攝氏/華氏）。

### 18. 🖼️ 圖片批次壓縮 (`/imgzip`)
- 支援多張圖片拖曳批次處理，可輸出 WebP、JPEG、PNG、AVIF。
- 可自訂壓縮品質 (Quality 10%~100%)，即時計算體積縮減比例與節省空間。

### 19. 🎬 影片壓縮 (`/videozip`)
- 純瀏覽器端壓縮，GPU 硬體加速。
- 提供 Discord (8MB/25MB)、WhatsApp (16MB)、Email (25MB) 等常用限制預設值與自訂 MB 目標。

### 20. 🎞️ 影片轉 GIF (`/video2gif`)
- 自訂擷取影片時間區段（起訖秒數）、畫質寬度與幀率 (FPS)。
- 即時轉換生成動畫 GIF 並支援點擊下載。

### 21. 💡 IDEA Box 提案產生器 (`/ideabox`)
- 結合 Cloudflare Pages Functions 代理呼叫 Google Gemini 2.5 AI 模型。
- 協助自動生成結構化商業提案，並可直接導出為 Microsoft Word (.docx) 檔案。

### 22. 🧰 PDF 進階工具 (`/stirlingpdf`)
- 導向 Stirling PDF 服務 (`https://pdf.dky.tw`)，支援 OCR 繁中/英文文字辨識、PDF 轉 Word/Excel/圖片、頁面旋轉與拆分分割。

---

## 🚀 部署架構 (Deployment)

1. **靜態工具箱 + Pages Function**：絕大多數工具皆為純前端本機運算；IDEA Box 透過 Cloudflare Pages Function 代理 API。
2. **邊緣網路**：針對 Cloudflare Pages 最佳化設計，設定 `dky_tw` 作為建置根目錄 (Root directory)。
3. **隱私與安全**：不資料庫儲存，檔案離線處理，15 小時自動清空。

---

## 👨‍💻 版權聲明
© 2026 DKY.tw — All operations run locally in your browser for maximum privacy and performance.
