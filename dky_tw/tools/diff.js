// 文字比對工具（模組） - 升級至字級比對與上下文截斷
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

export const compare = async (a, b) => {
  try {
    const DiffLib = await loadDiffLib();
    const strA = Array.isArray(a) ? a.join('\n') : a;
    const strB = Array.isArray(b) ? b.join('\n') : b;
    
    // 使用 diffWords 以單字為單位比對
    const diffs = DiffLib.diffWords(strA, strB);
    
    let html = '';
    
    // 處理上下文縮減 (若中間相同文字過長，保留前後2~3個詞，其餘變為 ...)
    const processedDiffs = [];
    for (let i = 0; i < diffs.length; i++) {
        let span = diffs[i];
        if (!span.added && !span.removed) {
            const hasPrev = i > 0;
            const hasNext = i < diffs.length - 1;
            
            // 將原本長字串以空白與換行為基準稍微切段
            const tokens = span.value.split(/(\s+)/);
            if (tokens.length > 20 && (hasPrev || hasNext)) {
               let newVal = '';
               const prefixWordCount = 6; // 大約相當於 2-3 個「有意義的詞」加上空白
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
    
    // 生成 HTML
    processedDiffs.forEach((part) => {
      // 若是異動部分，加上特定 CSS
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

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}