// 圖片批次壓縮工具 (Batch Image Compressor)
// 使用 Canvas API 在瀏覽器本地完成壓縮，絕不上傳圖片到任何伺服器
// 支援格式：JPG / PNG / WEBP / AVIF（依瀏覽器支援），不支援 GIF / SVG

const title = '圖片批次壓縮';
const desc = '一次拖入多張圖片（JPG/PNG/WEBP），自由選擇 WebP/JPEG/PNG/AVIF 輸出格式，調整品質後批次下載。零隱私風險，全部在瀏覽器端完成！';
const icon = '🖼️';

export const OUT_FORMATS = {
  webp: { label: 'WebP（體積最小）', mime: 'image/webp', ext: '.webp' },
  jpeg: { label: 'JPEG（最通用）', mime: 'image/jpeg', ext: '.jpg' },
  png:  { label: 'PNG（支援透明）', mime: 'image/png', ext: '.png' },
  avif: { label: 'AVIF（最新格式）', mime: 'image/avif', ext: '.avif' }
};

/**
 * 壓縮單張圖片
 * @param {File|Blob} file - 輸入的圖片檔案
 * @param {number} quality - 壓縮品質 0.1 ~ 1.0
 * @param {string} outputFormat - 輸出格式: 'webp'|'jpeg'|'png'|'avif'
 * @param {number} [maxWidth=0] - 最大寬度，0 表示不限制
 * @returns {Promise<{dataUrl: string, blob: Blob, size: number, mimeType: string, width: number, height: number, format: string}>}
 */
export const compress = (file, quality = 0.8, outputFormat = 'webp', maxWidth = 0) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        if (maxWidth > 0 && w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const format = OUT_FORMATS[outputFormat];
        const mimeType = format ? format.mime : 'image/webp';

        // AVIF 在某些瀏覽器不支援，fallback 到 WebP
        let useMime = mimeType;
        const dataUrl = canvas.toDataURL(useMime, quality);

        // 如果 AVIF 失敗（dataUrl 會是 PNG），fallback
        if (outputFormat === 'avif' && dataUrl.startsWith('data:image/png')) {
          useMime = 'image/webp';
          const webpDataUrl = canvas.toDataURL(useMime, quality);
          const base64 = webpDataUrl.split(',')[1] || '';
          const size = Math.round(base64.length * 0.75);

          canvas.toBlob(blob => {
            resolve({ dataUrl: webpDataUrl, blob, size, mimeType: useMime, width: w, height: h, format: 'webp', fallback: true });
          }, useMime, quality);
          return;
        }

        const base64 = dataUrl.split(',')[1] || '';
        const size = Math.round(base64.length * 0.75);

        canvas.toBlob(blob => {
          resolve({ dataUrl, blob, size, mimeType: useMime, width: w, height: h, format: outputFormat, fallback: false });
        }, useMime, quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * 格式化檔案大小
 */
export const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * 計算節省百分比
 */
export const savingsPercent = (original, compressed) => {
  if (!original || original === 0) return 0;
  return Math.round((1 - compressed / original) * 100);
};

export default { title, desc, icon, compress, formatSize, savingsPercent, OUT_FORMATS };
