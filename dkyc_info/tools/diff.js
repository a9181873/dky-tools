// 文字比對工具（模組）
export const compare = (a, b) => {
  const out = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    const av = a[i] ?? '', bv = b[i] ?? '';
    if (av === bv) {
      out.push(`<div class="diff-line"><span class="label">${escapeHtml(av)}</span></div>`);
    } else {
      if (av) out.push(`<div class="diff-line"><span class="label rem">- ${escapeHtml(av)}</span></div>`);
      if (bv) out.push(`<div class="diff-line"><span class="label add">+ ${escapeHtml(bv)}</span></div>`);
    }
  }
  return out.join('');
};

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}