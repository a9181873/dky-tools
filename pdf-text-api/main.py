"""
FastAPI 後端：PDF 文字擷取 API
端點：
  POST /api/extract       — 上傳 PDF 抽取文字
  GET  /api/health        — 健康檢查 (Cloudflare Tunnel 用)
  GET  /                  — 內嵌 Web UI（拖曳上傳介面）
"""
from __future__ import annotations

import logging
import os

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse

import parser as pdf_parser

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("pdf-api")

MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", "20"))
MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

# CORS：允許 DKY.tw 主站、子網域、本機開發
ALLOWED_ORIGINS = [
    "https://dky.tw",
    "https://www.dky.tw",
    "http://localhost:8000",
    "http://localhost:5173",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173",
]

app = FastAPI(title="PDF Text Extraction API",
              description="四層 fallback 引擎：PyMuPDF → Docling → pdftotext → Tesseract OCR",
              version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.dky\.tw$",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "pdf-text-api", "version": "1.0.0"}


@app.post("/api/extract")
async def extract_pdf(
    file: UploadFile = File(...),
    method: str = Query("auto", regex="^(auto|fitz|docling|pdftotext|tesseract)$"),
    langs: str = Query("zh,en", description="逗號分隔語言代碼，例如 zh,en 或 vi,en"),
    output: str = Query("json", regex="^(json|text)$"),
):
    # 1. 檔案類型 / 大小檢查
    if file.content_type not in ("application/pdf", "application/octet-stream") \
            and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="只接受 PDF 檔案")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="空檔案")
    if len(pdf_bytes) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413,
                            detail=f"檔案超過 {MAX_FILE_MB}MB 上限")

    # 2. 抽取
    lang_list = [s.strip() for s in (langs or "").split(",") if s.strip()]
    try:
        result = pdf_parser.extract(pdf_bytes, method=method, langs=lang_list)
    except Exception as e:
        logger.exception("extract failed")
        raise HTTPException(status_code=500, detail=f"抽取失敗：{e}")

    # 3. 回傳
    if output == "text":
        return PlainTextResponse(result["text"])
    return JSONResponse({
        "filename": file.filename,
        "method_used": result["method_used"],
        "text": result["text"],
        "page_count": result["page_count"],
        "char_count": result["char_count"],
        "took_ms": result["took_ms"],
        "tried": result["tried"],
    })


# ---- 內嵌 Web UI ----
INDEX_HTML = """<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PDF 文字擷取 API</title>
<style>
  body { font-family: -apple-system, "Noto Sans TC", sans-serif; max-width: 900px;
         margin: 40px auto; padding: 20px; background: #0f172a; color: #e2e8f0; }
  h1 { color: #38bdf8; }
  .drop { border: 2px dashed #38bdf8; border-radius: 12px; padding: 60px;
          text-align: center; cursor: pointer; transition: 0.2s; }
  .drop:hover, .drop.dragover { background: rgba(56,189,248,0.08); }
  .drop input { display: none; }
  .row { display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap; }
  select, button { padding: 10px 14px; border-radius: 8px; border: 1px solid #334155;
                   background: #1e293b; color: #e2e8f0; font-size: 14px; }
  button { background: #38bdf8; color: #0f172a; cursor: pointer; font-weight: 600; }
  button:hover { background: #0ea5e9; }
  pre { background: #1e293b; padding: 16px; border-radius: 8px; max-height: 60vh;
        overflow: auto; white-space: pre-wrap; font-size: 13px; }
  .meta { color: #94a3b8; font-size: 13px; margin: 8px 0; }
</style>
</head>
<body>
<h1>📄 PDF 文字擷取 API</h1>
<p class="meta">四層 fallback 引擎：PyMuPDF → Docling → pdftotext → Tesseract OCR</p>
<div class="row">
  <select id="method">
    <option value="auto">auto — 自動選擇</option>
    <option value="fitz">fitz — PyMuPDF</option>
    <option value="docling">docling — 佈局 + OCR</option>
    <option value="pdftotext">pdftotext — poppler</option>
    <option value="tesseract">tesseract — 強制 OCR</option>
  </select>
  <select id="langs">
    <option value="zh,en">繁中 + 英文</option>
    <option value="zh-CN,en">簡中 + 英文</option>
    <option value="vi,en">越南文 + 英文</option>
    <option value="ja,en">日文 + 英文</option>
    <option value="ko,en">韓文 + 英文</option>
    <option value="th,en">泰文 + 英文</option>
    <option value="en">純英文</option>
  </select>
</div>
<div class="drop" id="drop">
  <input type="file" id="file" accept="application/pdf,.pdf">
  📁 點擊或拖曳 PDF 檔案到這裡
</div>
<div class="meta" id="status"></div>
<pre id="out" style="display:none"></pre>
<script>
const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const status = document.getElementById('status');
const out = document.getElementById('out');
drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
drop.addEventListener('drop', e => {
  e.preventDefault(); drop.classList.remove('dragover');
  if (e.dataTransfer.files.length) { fileInput.files = e.dataTransfer.files; handle(); }
});
fileInput.addEventListener('change', handle);
async function handle() {
  const f = fileInput.files[0]; if (!f) return;
  const method = document.getElementById('method').value;
  const langs = document.getElementById('langs').value;
  status.textContent = `⏳ 處理中：${f.name} (${(f.size/1024).toFixed(1)}KB)…`;
  out.style.display = 'none';
  const fd = new FormData(); fd.append('file', f);
  try {
    const res = await fetch(`/api/extract?method=${method}&langs=${langs}`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || res.statusText);
    status.textContent = `✅ ${data.method_used} · ${data.page_count} 頁 · ${data.char_count} 字元 · ${data.took_ms}ms`;
    out.textContent = data.text;
    out.style.display = 'block';
  } catch (e) { status.textContent = `❌ ${e.message}`; }
}
</script>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
async def index():
    return INDEX_HTML
