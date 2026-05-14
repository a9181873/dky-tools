# DKY Tools (dky-tools)

這個儲存庫包含了 DKY 的兩個核心網頁工具專案，兩者均建構於 **Cloudflare Pages + Functions** 環境：

## 1. DKY 公開工具箱 (`dky_tw`)
這是一個對外公開的實用工具集合網站，提供各種日常開發或辦公可能需要的小工具。
- **網站入口**：通常部署於 `tools.dky.tw`
- **主要功能**：
  - **IDEA Box 提案產生器**：輔助生成提案文件（包含 AI 協助內容生成，並支援導出 Word/Docx 格式）。
  - **條碼與 QR Code 產生器**：可以快速製作文字或網址的 QR Code。
  - **資料編解碼**：包含 Base64、URL 編解碼。
  - **雜湊與格式化**：SHA-256 / MD5 計算、JSON 格式化工具。
  - **文字與代碼比對**：提供即時的文字 Diff 比對。
  - **其他小工具**：包含 UUID 產生器等。

## 2. DKY 私人工作台 (`dky_use`)
這是一個受密碼保護的私人工作空間，提供專屬的個人化工具。
- **網站入口**：通常部署於 `use.dky.tw`
- **主要功能**：
  - **密碼保護**：進入頁面需驗證存取權限。
  - **美股投資組合**：串接開源 API 與 Google Apps Script (GAS)，以即時追蹤美股報價、損益及資產變化。
  - **私人 IDEA Box**：與公開版類似，但提供專屬於私人的提案產生環境。

## 專案架構與開發技術
- **前端技術**：Vanilla JavaScript (ES6 Modules), HTML5, CSS3。無框架，極度輕量化。
- **後端技術**：Cloudflare Pages Functions (Serverless API)。包含與 Google Gemini AI 的串接 (在 IDEA Box 中運用 AI 生成提案內容)。
- **部署方式**：將 `dky_tw` 與 `dky_use` 分別設定為 Cloudflare Pages 專案，並綁定對應的自訂網域。支援 `_redirects` 與 `_headers` 等靜態網站配置。
- **安全與防護**：Cloudflare Functions 內建 CORS 跨域限制與 Request 驗證。

## 優化與維護
- 已實作模組化，核心邏輯如 IDEA Box、美股等均提取至 `tools/` 資料夾中作為獨立的模組。
- 具備防暴力破解（密碼嘗試過多鎖定）、Payload 大小限制等基礎防護措施。
