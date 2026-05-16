// PDF Viewer 工具
// 用 pdf.js 顯示原始 PDF（含 text layer，可直接拖曳選字 Ctrl+C 複製）
// 純本地，不會上傳檔案。

export const title = 'PDF 檢視 / 文字選取';
export const desc = '直接顯示 PDF 原貌，用滑鼠拖曳選字即可複製（pdf.js text layer，純本地）。';
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

/**
 * 把 PDF 單頁渲染成 Blob（給 C3 圖片匯出 / C2 縮圖用）
 * @param {Object} pdfDoc
 * @param {number} pageNum
 * @param {{dpi?:number, mime?:string, quality?:number}} opts
 * @returns {Promise<{blob:Blob, width:number, height:number}>}
 */
export const renderPageToBlob = async (pdfDoc, pageNum, { dpi = 150, mime = 'image/png', quality = 0.92 } = {}) => {
  const page = await pdfDoc.getPage(pageNum);
  const scale = dpi / 72; // PDF 原生 72 dpi
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  return { blob, width: canvas.width, height: canvas.height };
};

/**
 * 渲染縮圖 (給 C2 編輯頁面用)，回傳 dataURL
 */
export const renderThumbnail = async (pdfDoc, pageNum, { maxSize = 180 } = {}) => {
  const page = await pdfDoc.getPage(pageNum);
  const vp1 = page.getViewport({ scale: 1 });
  const scale = maxSize / Math.max(vp1.width, vp1.height);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
};

// ---- pdf-lib (用於 C2: 拆/合/旋/重排，純本地 PDF 編輯) ----
let pdfLibLoading = null;
export const loadPdfLib = () => {
  if (pdfLibLoading) return pdfLibLoading;
  if (typeof window !== 'undefined' && window.PDFLib) {
    pdfLibLoading = Promise.resolve(window.PDFLib);
    return pdfLibLoading;
  }
  pdfLibLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    s.onload = () => window.PDFLib ? resolve(window.PDFLib) : reject(new Error('pdf-lib 載入失敗'));
    s.onerror = () => reject(new Error('pdf-lib CDN 載入失敗'));
    document.head.appendChild(s);
  });
  return pdfLibLoading;
};

// ---- JSZip (用於 C3: 圖片打包) ----
let jsZipLoading = null;
export const loadJSZip = () => {
  if (jsZipLoading) return jsZipLoading;
  if (typeof window !== 'undefined' && window.JSZip) {
    jsZipLoading = Promise.resolve(window.JSZip);
    return jsZipLoading;
  }
  jsZipLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    s.onload = () => window.JSZip ? resolve(window.JSZip) : reject(new Error('JSZip 載入失敗'));
    s.onerror = () => reject(new Error('JSZip CDN 載入失敗'));
    document.head.appendChild(s);
  });
  return jsZipLoading;
};

/**
 * 解析頁範圍字串 "1-3,5,7-9" → [1,2,3,5,7,8,9]，越界自動截斷
 */
export const parsePageRange = (input, total) => {
  if (!input || !input.trim() || input.trim().toLowerCase() === 'all') {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out = new Set();
  for (const part of input.split(',')) {
    const seg = part.trim();
    if (!seg) continue;
    const m = seg.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = parseInt(m[1], 10), b = parseInt(m[2], 10);
      if (a > b) [a, b] = [b, a];
      for (let i = Math.max(1, a); i <= Math.min(total, b); i++) out.add(i);
    } else {
      const n = parseInt(seg, 10);
      if (Number.isFinite(n) && n >= 1 && n <= total) out.add(n);
    }
  }
  return [...out].sort((a, b) => a - b);
};

export default {
  title, desc, icon,
  loadPdfJs, loadPdfDocument, renderPdfPage,
  renderPageToBlob, renderThumbnail,
  loadPdfLib, loadJSZip, parsePageRange,
};
