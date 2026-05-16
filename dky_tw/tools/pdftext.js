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

export default { title, desc, icon, loadPdfJs, loadPdfDocument, renderPdfPage };
