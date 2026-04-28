// 圖片壓縮工具 (Image Compressor)
// 使用 Canvas API 在瀏覽器本地完成壓縮，絕不上傳圖片到任何伺服器
// 支援格式：JPG / PNG / WEBP（不支援 GIF / SVG）

const title = '圖片壓縮工具';
const desc = '拖曳或選擇圖片（JPG/PNG/WEBP），在瀏覽器本地完成壓縮，調整品質滑桿後直接下載。零隱私風險，不上傳任何資料！';
const icon = '🖼️';

/**
 * 壓縮圖片
 * @param {File} file - 輸入的圖片檔案物件
 * @param {number} quality - 壓縮品質 0.0 ~ 1.0
 * @param {number} [maxWidth=0] - 最大寬度，0 表示不限制
 * @returns {Promise<{dataUrl: string, blob: Blob, size: number}>}
 */
export const compress = (file, quality = 0.8, maxWidth = 0) => {
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

        // 如有設定最大寬度，依比例縮小
        if (maxWidth > 0 && w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        // 決定輸出格式
        // PNG 允許透明背景但一般較大，WEBP 最小，JPG 最通用
        const mimeType = file.type === 'image/png' ? 'image/png' : 
                         file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';

        const dataUrl = canvas.toDataURL(mimeType, quality);

        // 計算輸出大小 (bytes)
        const base64 = dataUrl.split(',')[1] || '';
        const size = Math.round(base64.length * 0.75); // Base64 解碼後大小估算

        canvas.toBlob(blob => {
          resolve({ dataUrl, blob, size, mimeType });
        }, mimeType, quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default { title, desc, icon, compress };
