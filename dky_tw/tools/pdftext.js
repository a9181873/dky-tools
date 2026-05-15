// PDF 文字擷取工具
// 主流程：呼叫遠端後端引擎 (pdf-api.dky.tw)；後端不可用時自動 fallback 到瀏覽器 pdf.js
import { extractPdfText as _extractLocal } from './diff.js';

export const title = 'PDF 文字擷取';
export const desc = '上傳 PDF → 後端引擎抽取文字（四層 fallback 含 OCR，支援掃描件與多語言）。檔案會傳到 dky.tw 自架後端，處理完即丟。後端離線時切換瀏覽器引擎（純本地）。';
export const icon = '📄';

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

export default { title, desc, icon, API_BASE, METHODS, LANGS, extractRemote, extractLocal };
