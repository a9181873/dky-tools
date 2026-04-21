// 顏色代碼轉換工具（模組）
const convert = (input) => {
  const h = input.hex?.trim();
  const r = parseInt(input.rgb?.r), g = parseInt(input.rgb?.g), b = parseInt(input.rgb?.b);
  let hex = '', rgb = '', hsl = '', cmyk = '';
  if (h) {
    const c = hexToRgb(h);
    if (c) { rgb = `rgb(${c.r},${c.g},${c.b})`; hsl = rgbToHsl(c.r, c.g, c.b); cmyk = rgbToCmyk(c.r, c.g, c.b); }
  } else if ([r,g,b].every(v => v>=0 && v<=255)) {
    hex = rgbToHex(r,g,b); rgb = `rgb(${r},${g},${b})`;
    hsl = rgbToHsl(r,g,b); cmyk = rgbToCmyk(r,g,b);
  }
  return { hex, rgb, hsl, cmyk };
};

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function rgbToHex(r, g, b) { return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''); }
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}
function rgbToCmyk(r, g, b) {
  if (r === 0 && g === 0 && b === 0) return 'cmyk(0, 0, 0, 100)';
  const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255, k = Math.min(c, m, y);
  const C = (c - k) / (1 - k), M = (m - k) / (1 - k), Y = (y - k) / (1 - k);
  return `cmyk(${Math.round(C * 100)}, ${Math.round(M * 100)}, ${Math.round(Y * 100)}, ${Math.round(k * 100)}%)`;
}

export default { convert };