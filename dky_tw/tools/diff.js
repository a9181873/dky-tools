// 文字比對工具（模組） - 升級支援 PDF 文字抽取比對
const loadDiffLib = () => {
  return new Promise((resolve, reject) => {
    if (typeof Diff !== 'undefined') return resolve(Diff);
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/diff@5.2.0/dist/diff.min.js';
    s.onload = () => resolve(window.Diff);
    s.onerror = reject;
    document.head.appendChild(s);
  });
};

// 載入 pdf.js（延遲載入，只在需要時才拉）
let pdfjsLoading = null;
const loadPdfJs = () => {
  if (pdfjsLoading) return pdfjsLoading;
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLoading = Promise.resolve(pdfjsLib);
    return pdfjsLoading;
  }
  pdfjsLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.min.mjs';
    s.type = 'module';
    s.onload = () => {
      // 設定 worker
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs';
        resolve(pdfjsLib);
      } else {
        reject(new Error('pdf.js 載入失敗'));
      }
    };
    s.onerror = () => reject(new Error('pdf.js CDN 載入失敗'));
    document.head.appendChild(s);
  });
  return pdfjsLoading;
};

/**
 * 從 PDF 檔案抽取文字
 * @param {File} file - PDF 檔案
 * @returns {Promise<string>} 抽取出的純文字
 */
export const extractPdfText = async (file) => {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    pages.push(`[第 ${i} 頁]\n${text}`);
  }
  return pages.join('\n\n');
};

/**
 * 比較兩段文字（支援字級比對）
 * @param {string|Array} a - 文字 A
 * @param {string|Array} b - 文字 B
 * @returns {Promise<string>} 比對結果 HTML
 */
export const compare = async (a, b) => {
  try {
    const DiffLib = await loadDiffLib();
    const strA = Array.isArray(a) ? a.join('\n') : a;
    const strB = Array.isArray(b) ? b.join('\n') : b;

    const diffs = DiffLib.diffWords(strA, strB);

    let html = '';

    // 上下文縮減（相同文字過長則省略中間）
    const processedDiffs = [];
    for (let i = 0; i < diffs.length; i++) {
      let span = diffs[i];
      if (!span.added && !span.removed) {
        const hasPrev = i > 0;
        const hasNext = i < diffs.length - 1;

        const tokens = span.value.split(/(\s+)/);
        if (tokens.length > 20 && (hasPrev || hasNext)) {
          let newVal = '';
          const prefixWordCount = 6;
          const suffixWordCount = 6;

          if (hasPrev) {
            newVal += tokens.slice(0, prefixWordCount).join('');
          }

          newVal += ' ... ';

          if (hasNext) {
            newVal += tokens.slice(-suffixWordCount).join('');
          }
          span.value = newVal;
        }
      }
      processedDiffs.push(span);
    }

    processedDiffs.forEach((part) => {
      const colorClass = part.added ? 'diff-added' : part.removed ? 'diff-removed' : '';
      const content = escapeHtml(part.value);

      if (colorClass) {
        html += `<span class="${colorClass}" style="padding:0 2px; border-radius:2px; ${part.added ? 'background-color:rgba(76,175,80,0.3); color:#81c784;' : 'background-color:rgba(244,67,54,0.3); color:#e57373; text-decoration:line-through;'}">${content}</span>`;
      } else {
        html += `<span style="color:#aaa;">${content}</span>`;
      }
    });

    return html;
  } catch (err) {
    return `比對載入失敗: ${err.message}`;
  }
};

/**
 * 逐行比對（用於 PDF 文字比對，更適合結構化文字）
 */
export const compareLines = async (a, b) => {
  try {
    const DiffLib = await loadDiffLib();
    const strA = Array.isArray(a) ? a.join('\n') : a;
    const strB = Array.isArray(b) ? b.join('\n') : b;

    const diffs = DiffLib.diffLines(strA, strB);

    let html = '';
    diffs.forEach((part) => {
      const colorClass = part.added ? 'diff-added' : part.removed ? 'diff-removed' : '';
      const content = escapeHtml(part.value);

      if (colorClass) {
        html += `<span class="${colorClass}" style="display:block;padding:2px 4px;border-radius:2px;margin:1px 0;${part.added ? 'background-color:rgba(76,175,80,0.25); color:#81c784;' : 'background-color:rgba(244,67,54,0.25); color:#e57373; text-decoration:line-through;'}">${content}</span>`;
      } else {
        html += `<span style="display:block;padding:2px 4px;color:#aaa;">${content}</span>`;
      }
    });

    return html;
  } catch (err) {
    return `比對載入失敗: ${err.message}`;
  }
};

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
