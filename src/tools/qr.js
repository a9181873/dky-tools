// QR Code 生成工具（模組） - 動態載入修復版
const loadQRLib = () => {
  return new Promise((resolve, reject) => {
    if (typeof QRCode !== 'undefined') return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
};

const generate = async (text, size = 256) => {
  await loadQRLib();
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, text, { width: size, margin: 2, color: { dark: '#00f2ff', light: '#0f0f13' } }, (error) => {
      if (error) reject(error);
      else resolve(canvas.toDataURL('image/png'));
    });
  });
};

export default { generate };