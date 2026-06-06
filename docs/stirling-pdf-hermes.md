# Stirling PDF + Hermes 自動化整合

本文件記錄 `tools.dky.tw` 對 Stirling PDF 的入口整合，以及 OCI 上 Stirling PDF 與 Hermes 的自動化用法。

## 架構總覽

- 人類使用入口：`https://pdf.dky.tw`
- 公開工具箱入口：`https://tools.dky.tw` 導覽列與首頁卡片的「PDF 進階」
- 舊路徑轉址：`https://tools.dky.tw/pdf` 會 302 轉到 `https://pdf.dky.tw`
- 服務部署位置：OCI 主機 `/home/ubuntu/stack`
- 反向代理：Caddy `pdf.{$DOMAIN}` 反代到 `stirling-pdf:8080`
- Hermes API 入口：`http://127.0.0.1:18080`
- Stirling 版本：Docker image `stirlingtools/stirling-pdf:latest-fat` (已升級為 fat 映像以修復 PDF 轉 DOCX 功能)
- 目前驗證版本：`2.11.0`

`tools.dky.tw` 只保留連往 Stirling PDF 的入口；原本較陽春的瀏覽器端 PDF 工具箱入口已撤下，避免功能重複。底層 `pdftext` 模組仍保留，因為「文字 / PDF 比對」仍需在瀏覽器端抽取 PDF 文字。

## 功能範圍

Stirling PDF 提供完整 PDF 工具平台，適合取代單點式 PDF 小工具。

目前主要使用情境：

- OCR：掃描 PDF 轉可搜尋 PDF，已安裝繁中 `chi_tra` 與英文 `eng`
- 壓縮 PDF：降低檔案大小，支援不同壓縮等級
- 合併 PDF：將多份 PDF 依指定順序合併
- 分割 PDF：依頁碼或每頁分割輸出 zip
- 擷取頁面：保留指定頁碼並輸出新 PDF
- PDF 轉文字：將可抽取文字輸出成 `.txt`
- PDF 轉 Word：輸出 `.docx`，適合後續人工編修
- 人類 Web UI：透過登入頁使用完整工具集
- Hermes 自動化：透過本機 API 由代理程式批次處理 PDF

已驗證能力：

- `https://pdf.dky.tw/login` 可正常開啟
- Hermes `stirling-pdf status` 回傳 `{"version":"2.11.0","status":"UP"}`
- 繁中 OCR 測試可抽出「保險 契約 受益人」
- `compress`、`merge`、`split`、`extract-pages`、`pdf-to-text`、`pdf-to-word` 均可正常輸出檔案

## 人類用法

1. 開啟 `https://tools.dky.tw`
2. 點選「PDF 進階」
3. 進入 `https://pdf.dky.tw/login`
4. 使用 Stirling PDF 帳號登入
5. 依需求選擇 OCR、壓縮、合併、分割、轉檔等工具

注意事項：

- Stirling 登入密碼不寫入 GitHub；正式值由 OCI `/home/ubuntu/stack/.env` 管理。
- Cloudflare proxy 對 Web UI 上傳有約 100MB request body 限制，目前 Caddy 設定為 95MB。
- 超過 Web UI 限制的大檔案建議交給 Hermes 走本機 API。

## Hermes 用法

Hermes 使用本機 CLI wrapper：

```bash
stirling-pdf <operation> ...
```

實際檔案：

- wrapper：`/home/ubuntu/.hermes/.local/bin/stirling-pdf`
- client：`/home/ubuntu/.hermes/scripts/stirling_pdf_client.py`
- skill：`/home/ubuntu/.hermes/skills/productivity/stirling-pdf/SKILL.md`
- API env：`/home/ubuntu/.hermes/.stirling-pdf.env`

環境設定：

- `STIRLING_PDF_URL=http://127.0.0.1:18080`
- `STIRLING_PDF_API_KEY` 由 OCI secret 檔管理，不提交到 GitHub

常用指令：

```bash
stirling-pdf status
```

```bash
stirling-pdf ocr input.pdf -o output.ocr.pdf
```

```bash
stirling-pdf compress input.pdf --level 5 -o output.compressed.pdf
```

```bash
stirling-pdf merge a.pdf b.pdf c.pdf -o merged.pdf
```

```bash
stirling-pdf split input.pdf --pages all -o split.zip
```

```bash
stirling-pdf extract-pages input.pdf --pages 1,3,5-9 -o pages.pdf
```

```bash
stirling-pdf pdf-to-text input.pdf -o output.txt
```

```bash
stirling-pdf pdf-to-word input.pdf -o output.docx
```

OCR 預設值：

- 語言：`chi_tra,eng`
- 模式：`skip-text`
- deskew：開啟
- clean：開啟
- sidecar：關閉
- 輸出目錄：未指定 `-o` 時使用 `/opt/data/workspace/pdf-results/` 或 `/home/ubuntu/.hermes/workspace/pdf-results/`

Google Drive 替代流程：

- 人類：先從 Google Drive 下載 PDF，再上傳到 `pdf.dky.tw`
- Hermes：可接收公開 Google Drive 分享連結，先下載到本機暫存，再呼叫 Stirling API
- 不使用 Stirling 內建 Google Drive Picker，因該功能屬官方 Server 付費層

## OCI 部署紀錄

Stirling PDF 由 OCI `/home/ubuntu/stack/docker-compose.yml` 管理：

- service：`stirling-pdf`
- image：`stirlingtools/stirling-pdf:latest-fat`
- internal network：供 Caddy 反代
- host binding：`127.0.0.1:18080:8080`，供 Hermes 使用
- volumes：
  - `./stirling-pdf/configs:/configs`
  - `./stirling-pdf/logs:/logs`
  - `./stirling-pdf/pipeline:/pipeline`
  - `./stirling-pdf/tessdata:/usr/share/tessdata`
  - `./stirling-pdf/customFiles:/customFiles`

### 純淨化補丁 (Clean UI Patch)
為了解決 v2.x 網頁 UI 充斥商業版 Pro 升級提示、問卷、Sponsor、GitHub 等無關連結，我們採用靜態 HTML 注入 CSS 補丁的方式將其徹底隱藏：
1. **環境變數調整**：
   - `DISABLE_PIXEL: "true"`
   - `SYSTEM_CUSTOMHTMLFILES: "true"`
2. **注入自訂 CSS 到 index.html**：
   由於 React 前端打包檔名含隨機 Hash，我們部署了 `patch_ui.py` 補丁腳本。該腳本在容器啟動後執行，會自動從 `/app/app.jar` 解壓出原始的 `static/index.html`，將隱藏 Pro UI 的 CSS (`hide-pro.css`) 內容以 `<style>` 標籤注入其 `<head>`，並輸出到 `/customFiles/static/index.html`。
3. **相關補丁程式碼**：
   - 靜態 CSS 規則：[hide-pro.css](file:///Users/jy/tools/dky-tools/pdf/stack/customFiles/static/css/hide-pro.css)
   - 自動注入腳本：[patch_ui.py](file:///Users/jy/tools/dky-tools/pdf/stack/customFiles/patch_ui.py)
   - 容器重啟後，只需在容器內執行一次：`docker exec -it stack-stirling-pdf-1 python3 /customFiles/patch_ui.py` 並重啟容器（或在啟動時自動載入）。

重要環境變數：

- `SECURITY_ENABLELOGIN=true`
- `DISABLE_ADDITIONAL_FEATURES=false`
- `SECURITY_INITIALLOGIN_USERNAME`
- `SECURITY_INITIALLOGIN_PASSWORD`
- `SECURITY_CUSTOMGLOBALAPIKEY`
- `SYSTEM_DEFAULTLOCALE=zh-TW`
- `LANGS=zh_TW,en_GB`
- `SYSTEM_GOOGLEVISIBILITY=false`
- `SYSTEM_ENABLEANALYTICS=false`
- `SYSTEM_MAXFILESIZE=95`

OCR 語言包：

- `eng.traineddata`
- `chi_tra.traineddata`

目前 `chi_tra` 使用 `tessdata_best`，以提升繁中辨識品質。

## 維運指令

檢查容器：

```bash
ssh oci "cd /home/ubuntu/stack && docker compose ps stirling-pdf"
```

檢查 API：

```bash
ssh oci "/home/ubuntu/.hermes/.local/bin/stirling-pdf status"
```

查看登入頁：

```bash
curl -I https://pdf.dky.tw/login
```

查看 OCR 語言：

```bash
ssh oci "docker exec stack-stirling-pdf-1 tesseract --list-langs"
```

重啟 Stirling：

```bash
ssh oci "cd /home/ubuntu/stack && docker compose restart stirling-pdf"
```

更新 `tools.dky.tw`：

```bash
npx wrangler@latest pages deploy dky_tw --project-name=dky-tools
```

## 安全與資料處理

- Web UI 使用 Stirling 內建登入控管。
- Hermes 使用 `X-API-KEY` 呼叫本機 API。
- API key、登入密碼與初始密碼不提交到 GitHub。
- `pdf.dky.tw` 加上 `X-Robots-Tag: noindex, nofollow, noarchive`。
- Stirling 的 `/configs` 內含使用者 DB 與設定，需納入 OCI 備份。
- 大檔案建議由 Hermes 走本機 API，避免 Cloudflare request body 限制。

## 未來可增加功能

優先建議：

- Cloudflare Access：在 Stirling 登入外再加一層 Zero Trust，適合多人或半公開使用。
- Uptime Kuma 監控：加入 `https://pdf.dky.tw/login` 與本機 API health check。
- Hermes 批次工作流：支援「資料夾內所有 PDF OCR 後壓縮」。
- OCR 後自動分類：依檔名、頁數、關鍵字或文字內容自動命名。
- OCR 品質設定檔：提供保險文件、掃描合約、表格文件等 presets。
- Google Drive 自動下載：強化私有 Drive 檔案授權流程。
- 結果回傳連結：將 Hermes 輸出檔上傳到 R2 或 Drive，回傳短連結。
- 文件比對工作流：將兩份 PDF OCR 後抽文字，再接現有 Diff 工具或 Hermes 摘要。
- 使用量稽核：記錄 Hermes 呼叫工具、處理檔名、輸出位置與耗時。
- 定期更新流程：固定檢查 Stirling release note，避免 `latest` 更新造成行為差異。

進階方向：

- 啟用 Stirling Pipeline，將 OCR、移除空白頁、壓縮、加 metadata 串成固定流程。
- 加入 n8n webhook，讓外部服務可丟 PDF 給 Hermes/Stirling 處理。
- 建立內部 PDF API gateway，包裝常用功能成更穩定的 DKY API。
- 若購買 Stirling Server 授權，可啟用官方 Google Drive File Picker 與更完整的企業功能。
