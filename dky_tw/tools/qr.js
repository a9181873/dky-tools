// QR Code 生成工具（模組） - 動態載入修復版
let libLoaded = false;

const loadQRLib = () => {
  return new Promise((resolve, reject) => {
    if (libLoaded || window.QRCode) { libLoaded = true; return resolve(); }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js';
    s.onload = () => { libLoaded = true; resolve(); };
    s.onerror = () => reject(new Error('QR Code 函式庫載入失敗'));
    document.head.appendChild(s);
  });
};

export const generate = async (text, size = 256) => {
  await loadQRLib();
  if (!window.QRCode?.toCanvas) {
    throw new Error('QR Code 函式庫未正確載入');
  }
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    window.QRCode.toCanvas(canvas, text, { width: size, margin: 2, color: { dark: '#00f2ff', light: '#0f0f13' } }, (error) => {
      if (error) reject(error);
      else resolve(canvas.toDataURL('image/png'));
    });
  });
};