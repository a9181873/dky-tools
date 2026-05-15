// PDF 文字擷取工具
// 主流程：呼叫遠端後端引擎 (pdf-api.dky.tw)；後端不可用時自動 fallback 到瀏覽器 pdf.js
import { extractPdfText as _extractLocal } from './diff.js';

export const title = 'PDF 文字擷取';
export const desc = '上傳任意 PDF，後端引擎自動四層 fallback (PyMuPDF → Docling → pdftotext → Tesseract OCR) 抽取文字。後端離線時自動切換到瀏覽器 pdf.js 引擎。';
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
 * @returns {Promise<{method_used, text, page_count, char_count, took_ms}>}
 */
export const extractRemote = async (file, { method = 'auto', langs = 'zh,en' } = {}) => {
  const fd = new FormData();
  fd.append('file', file);
  const url = new URL(`${API_BASE}/api/extract`);
  url.searchParams.set('method', method);
  url.searchParams.set('langs', langs);
  url.searchParams.set('output', 'json');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 90000);
  try {
    const res = await fetch(url, { method: 'POST', body: fd, signal: ctrl.signal });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}${errText ? `: ${errText.slice(0, 200)}` : ''}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
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
