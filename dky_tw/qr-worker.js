// QR Code worker (optional, for heavy generation off-main-thread)
self.addEventListener('message', async (e) => {
  const { text, width = 256 } = e.data;
  try {
    const QRCode = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js');
    const canvas = new OffscreenCanvas(width, width);
    await QRCode.default.toCanvas(canvas, text, { margin: 2 });
    self.postMessage({ url: canvas.convertToBlob ? await canvas.convertToBlob() : canvas.toDataURL('image/png') });
  } catch (err) {
    self.postMessage({ error: err.message });
  }
});