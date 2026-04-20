# DKY.tw 免費線上工具箱

## 說明
- 網域：DKY.tw（Cloudflare Workers + KV）
- 技術：Vite + Vanilla JS，Workers 部署
- 主題：深色、霓虹/賽博龐克風格

## 快速啟動（開發者）

```bash
# 1. 取得專案
git clone <your-repo-url>
cd dky-tools

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 部署到 Cloudflare Workers
npm run deploy
```

## 工具列表

| 路由 | 工具 | 說明 |
|------|------|------|
| `/` | 首頁 | 工具總覽卡片 |
| `/qr` | QR Code 生成器 | 輸入文字/連結，即時預覽，支援 SVG/PNG 下載 |
| `/color` | 顏色代碼轉換 | HEX ↔ RGB ↔ HSL ↔ CMYK，色票預覽 |
| `/json` | JSON 格式化 | 美化/壓縮，錯誤提示，一鍵複製 |
| `/base64` | Base64 編解碼 | 文字與檔案模式，拖曳上傳 |
| `/diff` | 文字比對 | 雙欄輸入，差異高亮，統計行數 |
| `/download` | YouTube/IG/X 下載 | 輸入連結，解析後提供多格式下載 |

## 部署教學

1. Cloudflare 帳號 → 加入網域 → 啟用 Workers
2. DNS 設定 CNAME → `workers.dev` 或自訂域名
3. `wrangler login` → `wrangler deploy`

## 未來擴充

- Oracle ARM VM：用於長時間任務（影片轉檔）
- KV 快取：提升頻繁請求效能
- GitHub Actions：自動化測試與部署