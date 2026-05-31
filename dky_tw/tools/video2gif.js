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

// GIF 預設
export const PRESETS = [
  { label: '小 (320px, 10fps)', width: 320, fps: 10 },
  { label: '中 (480px, 15fps)', width: 480, fps: 15 },
  { label: '大 (640px, 15fps)', width: 640, fps: 15 },
  { label: '自訂', width: -1, fps: -1 },
];

// 取得影片資訊
const getVideoInfo = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('無法讀取影片'));
    };
    video.src = URL.createObjectURL(file);
  });
};

// GIF 編碼器動態載入
const loadGifEncoder = () => {
  return new Promise((resolve, reject) => {
    if (window.GIF) return resolve(window.GIF);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/gif.js.optimized@1.0.1/dist/gif.js';
    script.onload = () => resolve(window.GIF);
    script.onerror = () => reject(new Error('GIF 編碼器載入失敗'));
    document.head.appendChild(script);
  });
};

// 主轉換函式
export const convert = async (file, options, onProgress) => {
  const { startTime, endTime, maxWidth, fps } = options;
  const duration = endTime - startTime;
  const totalFrames = Math.round(duration * fps);

  await loadGifEncoder();

  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    video.onloadedmetadata = async () => {
      // 計算縮放比例
      const scale = maxWidth > 0 ? Math.min(1, maxWidth / video.videoWidth) : 1;
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript: 'https://unpkg.com/gif.js.optimized@1.0.1/dist/gif.worker.js',
      });

      const frames = [];
      let frameIdx = 0;

      // Seek to start
      video.currentTime = startTime;
      await new Promise(r => { video.onseeked = r; });

      // Capture frames
      const captureNext = () => {
        if (video.currentTime >= endTime || video.ended) {
          // All frames captured, render GIF
          onProgress && onProgress(95);
          gif.on('finished', (blob) => {
            onProgress && onProgress(100);
            URL.revokeObjectURL(video.src);
            resolve({ blob, ext: '.gif', frames: frameIdx });
          });
          gif.on('error', (e) => {
            URL.revokeObjectURL(video.src);
            reject(e);
          });
          gif.render();
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        gif.addFrame(ctx, { copy: true, delay: 1000 / fps });

        frameIdx++;
        if (onProgress && frameIdx % 5 === 0) {
          onProgress(Math.min(Math.round((frameIdx / totalFrames) * 90), 90));
        }

        video.currentTime = startTime + frameIdx / fps;
      };

      video.onseeked = captureNext;
      video.onended = () => {
        if (frameIdx === 0) {
          URL.revokeObjectURL(video.src);
          reject(new Error('無法擷取畫面'));
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('影片播放失敗'));
      };

      captureNext();
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('無法載入影片'));
    };

    video.src = URL.createObjectURL(file);
    video.playsInline = true;
    video.muted = true;
  });
};

export default { title, desc, icon, convert, formatSize, formatTime, PRESETS };
