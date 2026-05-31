// 影片轉 GIF 工具 (Video to GIF Converter)
// Canvas 逐幀擷取 → GIF 編碼，純瀏覽器端，零上傳
// 外部依賴：gif.js (CDN) — GIF 編碼器

export const title = '影片轉 GIF';
export const desc = '擷取影片片段轉成 GIF 動圖。自訂幀率、畫質、起迄秒數，適合做 Discord/Telegram 貼圖或社群分享。100% 本機處理。';
export const icon = '🎞️';

export const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
};

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const PRESETS = [
  { label: '小 (320px, 10fps)', width: 320, fps: 10 },
  { label: '中 (480px, 15fps)', width: 480, fps: 15 },
  { label: '大 (640px, 15fps)', width: 640, fps: 15 },
  { label: '自訂', width: -1, fps: -1 },
];

const GIF_CDN = 'https://unpkg.com/gif.js.optimized@1.0.1/dist/gif.js';
const WORKER_CDN = 'https://unpkg.com/gif.js.optimized@1.0.1/dist/gif.worker.js';

const loadGifEncoder = () => {
  return new Promise((resolve, reject) => {
    if (window.GIF) return resolve();
    const script = document.createElement('script');
    script.src = GIF_CDN;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GIF 編碼器載入失敗'));
    document.head.appendChild(script);
  });
};

// 等待 seek 完成
const waitForSeek = (video, targetTime) => {
  return new Promise((resolve) => {
    const handler = () => {
      video.removeEventListener('seeked', handler);
      resolve();
    };
    video.addEventListener('seeked', handler);
    video.currentTime = targetTime;
  });
};

export const convert = async (file, options, onProgress) => {
  const { startTime, endTime, maxWidth, fps } = options;
  const captureDuration = endTime - startTime;
  const frameCount = Math.ceil(captureDuration * fps);
  const frameDelay = 1000 / fps;

  if (frameCount < 1) throw new Error('擷取範圍過短，請增加秒數或幀率');

  await loadGifEncoder();

  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    video.onloadedmetadata = async () => {
      // 計算縮放
      const scale = maxWidth > 0 ? Math.min(1, maxWidth / video.videoWidth) : 1;
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript: WORKER_CDN,
      });

      gif.on('finished', (blob) => {
        onProgress && onProgress(100);
        URL.revokeObjectURL(video.src);
        resolve({ blob, ext: '.gif', frames: frameCount });
      });
      gif.on('error', (e) => {
        URL.revokeObjectURL(video.src);
        reject(e || new Error('GIF 編碼失敗'));
      });

      // 逐幀擷取
      for (let i = 0; i < frameCount; i++) {
        const t = startTime + i / fps;
        await waitForSeek(video, t);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        gif.addFrame(canvas, { copy: true, delay: frameDelay });

        if (onProgress && i % 3 === 0) {
          onProgress(Math.min(Math.round((i / frameCount) * 90), 90));
        }
      }

      onProgress && onProgress(95);
      gif.render();
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('無法載入影片'));
    };

    video.src = URL.createObjectURL(file);
    video.playsInline = true;
    video.muted = true;
    video.preload = 'auto';
  });
};

export default { title, desc, icon, convert, formatSize, formatTime, PRESETS };
