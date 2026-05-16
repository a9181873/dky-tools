// PDF Viewer + 文字擷取工具
// 主流程：用 pdf.js 顯示原始 PDF（含 text layer，可直接拖曳選字 Ctrl+C 複製）
// 輔助：「複製全頁文字」走後端 API 取乾淨抽取結果
import { extractPdfText as _extractLocal } from './diff.js';

export const title = 'PDF 檢視 / 文字選取';
export const desc = '直接顯示 PDF 原貌，用滑鼠拖曳選字即可複製（pdf.js text layer，純本地）。掃描件選不到字時，可按「複製全頁文字」走後端 OCR。';
export const icon = '📄';

const PDFJS_VERSION = '4.9.155';

let pdfjsLoading = null;
export const loadPdfJs = () => {
  if (pdfjsLoading) return pdfjsLoading;
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    pdfjsLoading = Promise.resolve(window.pdfjsLib);
    return pdfjsLoading;
  }
  pdfjsLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`;
    s.type = 'module';
    s.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
        resolve(window.pdfjsLib);
      } else reject(new Error('pdf.js 載入失敗'));
    };
    s.onerror = () => reject(new Error('pdf.js CDN 載入失敗'));
    document.head.appendChild(s);
  });
  return pdfjsLoading;
};

/**
 * 載入 PDF 檔（回傳 pdfjs document，可重複呼叫 getPage）
 */
export const loadPdfDocument = async (file) => {
  const pdfjs = await loadPdfJs();
  const buf = await file.arrayBuffer();
  return pdfjs.getDocument({ data: buf }).promise;
};

/**
 * 在 container 內渲染 PDF 單頁（canvas + text layer）
 * @param {Object} pdfDoc - pdf.js document
 * @param {HTMLElement} container
 * @param {{pageNum:number, scale:number}} opts
 */
export const renderPdfPage = async (pdfDoc, container, { pageNum = 1, scale = 1.25 } = {}) => {
  const pdfjs = await loadPdfJs();
  const page = await pdfDoc.getPage(pageNum);

  const outputScale = window.devicePixelRatio || 1;
  const viewport = page.getViewport({ scale });

  container.innerHTML = '';
  const pageDiv = document.createElement('div');
  pageDiv.className = 'pdf-page';
  pageDiv.style.width = `${viewport.width}px`;
  pageDiv.style.height = `${viewport.height}px`;

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  const ctx = canvas.getContext('2d');

  pageDiv.appendChild(canvas);

  const textLayerDiv = document.createElement('div');
  textLayerDiv.className = 'textLayer';
  textLayerDiv.style.width = `${viewport.width}px`;
  textLayerDiv.style.height = `${viewport.height}px`;
  pageDiv.appendChild(textLayerDiv);

  container.appendChild(pageDiv);

  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
  await page.render({ canvasContext: ctx, viewport, transform }).promise;

  const textContent = await page.getTextContent();
  // pdf.js v4: 用 TextLayer class 較穩；fallback 到舊版 renderTextLayer
  if (pdfjs.TextLayer) {
    const tl = new pdfjs.TextLayer({ textContentSource: textContent, container: textLayerDiv, viewport });
    await tl.render();
  } else if (pdfjs.renderTextLayer) {
    await pdfjs.renderTextLayer({ textContentSource: textContent, container: textLayerDiv, viewport, textDivs: [] }).promise;
  }
  return { width: viewport.width, height: viewport.height };
};

export const API_BASE = 'https://pdf-api.dky.tw';

export const METHODS = {
  auto:      'auto — 自動選擇 (推薦)',
  fitz:      'fitz — PyMuPDF 文字層 (最快)',
  docling:   'docling — 佈局分析 + OCR',
  pdftotext: 'pdftotext — poppler 純文字',
  tesseract: 'tesseract — 強制 OCR (掃描件)',
};

export const LANGS = {
  'zh,en':    '繁中 + 英文 (預設)',
  'zh-CN,en': '簡中 + 英文',
  'vi,en':    '越南文 + 英文',
  'ja,en':    '日文 + 英文',
  'ko,en':    '韓文 + 英文',
  'th,en':    '泰文 + 英文',
  'fr,en':    '法文 + 英文',
  'de,en':    '德文 + 英文',
  'es,en':    '西班牙文 + 英文',
  'pt,en':    '葡萄牙文 + 英文',
  'en':       '純英文',
};

/**
 * 呼叫後端 API 抽取 PDF 文字
 * @param {File} file
 * @param {Object} opts
 * @param {string} [opts.method='auto']
 * @param {string} [opts.langs='zh,en']
 * @param {AbortSignal} [opts.signal] 用來取消請求
 * @param {(p:{phase:'uploading'|'processing', percent:number|null}) => void} [opts.onProgress]
 * @returns {Promise<{method_used, text, page_count, char_count, took_ms}>}
 */
export const extractRemote = (file, { method = 'auto', langs = 'zh,en', signal, onProgress } = {}) => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));

    const xhr = new XMLHttpRequest();
    const url = `${API_BASE}/api/extract?method=${encodeURIComponent(method)}&langs=${encodeURIComponent(langs)}&output=json`;
    xhr.open('POST', url);
    xhr.timeout = 120000;

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress({ phase: 'uploading', percent: (e.loaded / e.total) * 100 });
      };
      xhr.upload.onload = () => onProgress({ phase: 'processing', percent: null });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch (e) { reject(new Error('Invalid JSON: ' + e.message)); }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${(xhr.responseText || '').slice(0, 200)}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error / CORS'));
    xhr.ontimeout = () => reject(new Error('Timeout (>120s)'));
    xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));

    if (signal) signal.addEventListener('abort', () => xhr.abort(), { once: true });

    const fd = new FormData();
    fd.append('file', file);
    xhr.send(fd);
  });
};

/**
 * 後端離線時的瀏覽器 fallback (重用 diff.js 的 pdf.js 抽取)
 */
export const extractLocal = async (file) => {
  const text = await _extractLocal(file);
  const pageMatches = text.match(/^\[第 \d+ 頁\]/mg) || [];
  return {
    method_used: 'pdfjs (browser)',
    text,
    page_count: pageMatches.length,
    char_count: text.length,
    took_ms: 0,
  };
};

export default { title, desc, icon, API_BASE, METHODS, LANGS, extractRemote, extractLocal, loadPdfJs, loadPdfDocument, renderPdfPage };
