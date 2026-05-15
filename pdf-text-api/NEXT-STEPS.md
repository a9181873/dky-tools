# PDF 工具下一階段規劃

## Context（為什麼要改）

當前 `tools.dky.tw/pdf` 是「上傳 PDF → 純文字輸出」設計，但用戶實測後澄清真實需求：

- ❌ 不要雙欄（PDF + 抽取文字並排）
- ❌ 不要純粹「上傳→純文字輸出」
- ✅ **顯示原始 PDF 樣貌**（可縮放、可翻頁）
- ✅ **直接在 PDF 上「圈選」想要的文字 → 複製**（像 Acrobat / Chrome PDF viewer）

當前後端 OCR/抽取功能不是用戶的核心需求 — 真正要的是 pdf.js 內建的 **text layer** 功能。

---

## 為什麼 pdf.js Text Layer 完美匹配需求

PDF.js 渲染 PDF 時做兩件事：

1. **Canvas Layer** — 把每頁渲染成圖片（視覺上的「PDF 原始樣貌」）
2. **Text Layer** — 在 canvas 上方疊一個透明的 HTML 層，含每個字元的位置、字體、寬度

使用者用滑鼠在 PDF 上拖曳選取時，瀏覽器原生選字機制會作用在 text layer 上 → 直接 Ctrl+C 複製到剪貼簿。**就是用戶要的功能**，不需要任何 OCR 或後端抽取。

唯一限制：純掃描件（無文字層）pdf.js 的 text layer 是空的 → 選不到文字。可加「對掃描件做 OCR」按鈕，把 OCR 結果疊回 text layer（進階功能，第二版）。

---

## 實作範圍

### 必做（第一版）
1. **單欄 PDF Viewer**（占滿可用寬度）
2. **工具列**：縮放 ±、適合寬度、翻頁 `< 1/N >`、跳頁
3. **text layer 啟用**（讓使用者可選字）
4. **下載/列印**（瀏覽器原生）

### 移除
- 「方法/語言下拉」
- 「進度條」
- 「複製全文/下載 .txt」（針對「上傳→純文字」UI 已用不上）
- 「橘色警告」（第一版只用 pdf.js 不會上傳）

### 保留
- **「📋 複製全頁文字」按鈕** — 一鍵抓全頁，做為輔助。按下時才打後端 API。

### 暫不做（第二版考慮）
- 掃描件 OCR overlay（pdf.js text layer 為空時自動呼叫後端 OCR 把文字疊回去）
- 多檔案分頁瀏覽
- 標註/螢光筆

---

## 檔案改動

| 檔案 | 改動 |
|---|---|
| `dky_tw/app.js` | `renderFields.pdf` 整段重寫為 PDF Viewer UI；handlers 改為 `handlePdfFileChange` 渲染 viewer、`handlePdfZoom`、`handlePdfPage` |
| `dky_tw/tools/pdftext.js` | 加 `renderPdf(file, container, {scale, page})` 用 pdf.js 渲染（含 text layer）；保留既有 `extractRemote/extractLocal` 給「複製全頁文字」按鈕用 |
| `dky_tw/styles.css` | 加 `.pdf-viewer` 容器樣式、text layer 透明 selection 顏色 |
| `dky_tw/sw.js` | bump cache 至 v11 |

---

## 後端

**主功能不動**。`pdf-text-api` 服務保留，當「複製全頁文字」按下時仍會打 API 拿乾淨抽取結果。掃描件 OCR 第二版會用到。

### 加：資源 / 效能 Log 留存

每次 `/api/extract` 呼叫結束後寫一行 JSON 到 `/app/logs/api.jsonl`：

```json
{
  "ts": "2026-05-15T13:45:01.234Z",
  "ip": "1.2.3.4",
  "filename": "report.pdf",
  "size_bytes": 524288,
  "method_requested": "auto",
  "method_used": "fitz",
  "page_count": 12,
  "char_count": 8421,
  "took_ms": 230,
  "cpu_percent_avg": 18.5,
  "rss_mb_peak": 412,
  "status": "ok"
}
```

實作要點：

- `requirements.txt` 加 `psutil==6.1.0`
- `main.py` 加 middleware 或在 `/api/extract` handler 開始/結束時用 `psutil.Process()` 取樣
- log 寫到 `/app/logs/api.jsonl`（每行一個 JSON，方便 `jq` 或 `pandas.read_json(lines=True)` 分析）
- `docker-compose.yml` 掛 volume：`./logs:/app/logs` → host 端 `~/pdf-text-api/logs/api.jsonl` 永久保留
- logrotate：`/etc/logrotate.d/pdf-text-api` 設 `rotate 30 daily compress` 防止無限增長

驗證：

```bash
tail -f ~/pdf-text-api/logs/api.jsonl | jq .
# 看到每次上傳產生一行 JSON，含時間/檔名/方法/秒數/CPU/MEM
```

---

## pdf.js 整合要點

```js
// 渲染一頁 + text layer
const page = await pdf.getPage(pageNum);
const viewport = page.getViewport({ scale });
canvas.width = viewport.width;
canvas.height = viewport.height;
await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

// text layer
const textContent = await page.getTextContent();
const textLayerDiv = document.createElement('div');
textLayerDiv.className = 'textLayer';
textLayerDiv.style.cssText = `position:absolute; top:0; left:0; width:${viewport.width}px; height:${viewport.height}px;`;
pdfjsLib.renderTextLayer({
  textContent,
  container: textLayerDiv,
  viewport,
  textDivs: [],
});
```

CSS 給 text layer 透明 + selection 顏色：

```css
.textLayer { opacity: 0.2; line-height: 1.0; }
.textLayer ::selection { background: rgba(0, 242, 255, 0.4); }
```

---

## 旁支評估：接入 mineru-api 提升辨識品質

OCI 上 `mineru-api-minerU` 容器健康（version 3.1.13），pdf-text-api 跟它在同個 `internal` docker network，可以零成本接入。MinerU 對中文 + 表格 + 掃描件辨識業界開源最強之一。

但**用戶真實需求是 PDF Viewer with text selection**，OCR 升級暫不優先。等第二版做掃描件 OCR overlay 時再接入。

接入細節（備忘）：
- `parser.py` 加 `_with_mineru()` 用 `requests.post(f"{MINERU_URL}/file_parse", ...)` 同步呼叫
- `METHODS_ORDER` 改為 `(fitz, mineru, tesseract)`
- 不需 rebuild docker image（純 HTTP 呼叫，沒新 Python 套件）
- mineru 並發 3，多人同時用會排隊

---

## 部署 / 驗證

1. wrangler deploy → tools.dky.tw/pdf
2. 測試：
   - 文字 PDF（合約、報告）→ 可縮放、可翻頁、用滑鼠拖曳選字 → Ctrl+C 複製
   - 掃描 PDF → 顯示頁面但選不到字（預期），按「複製全頁文字」走後端 OCR
3. RWD：手機豎屏要能看完整頁
4. `tail -f ~/pdf-text-api/logs/api.jsonl` 看到 log 寫入
5. git commit + push

## 估時
- PDF Viewer + text layer：2-3 小時
- 後端 log 留存：1 小時
- 測試：0.5 小時
