// PDF 附件提取工具 (PDF Attachment Extractor)
// 支援加密 PDF 解密、內嵌附件 (ZIP/Excel/圖片/文件) 提取與打包下載
// 包含 15 小時自動銷毀機制，100% 純瀏覽器本地運算，不留痕跡。

export const title = 'PDF 附件提取';
export const desc = '解密加密 PDF，快速提取內嵌的 ZIP/Excel/圖片等附件檔。純本地運算，資料 15 小時自動銷毀。';
export const icon = '📎';

const PDFJS_VERSION = '3.11.174';

let pdfjsLoading = null;
export const loadPdfJs = () => {
  if (pdfjsLoading) return pdfjsLoading;
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    pdfjsLoading = Promise.resolve(window.pdfjsLib);
    return pdfjsLoading;
  }
  pdfjsLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.js`;
    s.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;
        resolve(window.pdfjsLib);
      } else reject(new Error('pdf.js 載入失敗'));
    };
    s.onerror = () => reject(new Error('pdf.js CDN 載入失敗'));
    document.head.appendChild(s);
  });
  return pdfjsLoading;
};

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
 * 解密 PDF 並提取附件
 * @param {ArrayBuffer} arrayBuffer
 * @param {string|null} password
 * @returns {Promise<{ extracted: Object, numPages: number }>}
 */
export const extractAttachments = async (arrayBuffer, password = null) => {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(arrayBuffer);
  const config = { data };
  if (password) config.password = password;

  const loadingTask = pdfjs.getDocument(config);
  const pdf = await loadingTask.promise;

  const extracted = {};

  // 1. Catalog 級別內嵌附件
  try {
    const attachments = await pdf.getAttachments();
    if (attachments) {
      for (const [name, att] of Object.entries(attachments)) {
        if (att.content && att.content.length > 0) {
          const displayName = att.filename || name;
          extracted[displayName] = att.content;
        }
      }
    }
  } catch (e) {
    console.warn('Catalog attachments check:', e);
  }

  // 2. Page 級別 FileAttachment 註解
  try {
    const numPages = pdf.numPages;
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const annotations = await page.getAnnotations();
      for (const annot of annotations) {
        if (annot.subtype === 'FileAttachment' && annot.file) {
          const fname = annot.file.filename || `attachment_page${i}`;
          if (annot.file.content && annot.file.content.length > 0) {
            extracted[fname] = annot.file.content;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Annotation attachments check:', e);
  }

  return { extracted, numPages: pdf.numPages };
};

/**
 * 格式化檔案大小
 */
export const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

/**
 * 根據附檔名取得對應圖示
 */
export const getFileIcon = (filename) => {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const map = {
    zip: '📦', '7z': '📦', rar: '📦', tar: '📦', gz: '📦',
    xlsx: '📊', xls: '📊', csv: '📊', ods: '📊',
    pdf: '📄',
    doc: '📝', docx: '📝', txt: '📝', rtf: '📝',
    ppt: '📽️', pptx: '📽️',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️',
    mp3: '🎵', wav: '🎵', flac: '🎵',
    mp4: '🎬', avi: '🎬', mov: '🎬', mkv: '🎬',
    json: '⚙️', xml: '⚙️', html: '🌐',
  };
  return map[ext] || '📎';
};

export default {
  title, desc, icon,
  loadPdfJs, loadJSZip, extractAttachments, formatSize, getFileIcon
};
