// QR Code 生成工具（模組）
export const generate = (text, size = 256) => {
  return new Promise((resolve, reject) => {
    if (typeof QRCode === 'undefined') return reject(new Error('QRCode lib not loaded'));
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, text, { width: size, margin: 2, color: { dark: '#00f2ff', light: '#0f0f13' } }, (error) => {
      if (error) reject(error);
      else resolve(canvas.toDataURL('image/png'));
    });
  });
};