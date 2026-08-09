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

// 快取 worker blob URL，避免重複 fetch
let _workerBlobUrl = null;

/**
 * 透過 fetch 把外部 worker.js 拉下來轉成同源 Blob URL，
 * 徹底繞過 Web Worker 的跨域限制 (CORS)。
 * 這是原本卡在 90% 的根本原因。
 */
const getWorkerBlobUrl = async () => {
  if (_workerBlobUrl) return _workerBlobUrl;
  const res = await fetch(WORKER_CDN);
  if (!res.ok) throw new Error('GIF Worker 載入失敗: ' + res.status);
  const text = await res.text();
  const blob = new Blob([text], { type: 'application/javascript' });
  _workerBlobUrl = URL.createObjectURL(blob);
  return _workerBlobUrl;
};

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

// 等待 seek 完成（含超時保護，避免 seek 卡死）
const waitForSeek = (video, targetTime) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      video.removeEventListener('seeked', handler);
      // 仍然 resolve 而非 reject，因為某些瀏覽器 seek 事件可能漏掉
      resolve();
    }, 3000);
    const handler = () => {
      clearTimeout(timeout);
      video.removeEventListener('seeked', handler);
      resolve();
    };
    video.addEventListener('seeked', handler);
    video.currentTime = targetTime;
  });
};

const MAX_FRAMES = 600;        // 硬上限：600 幀 (15fps → 最長 40 秒)
const RENDER_TIMEOUT = 300000; // gif.render() 最長等 5 分鐘

export const convert = async (file, options, onProgress) => {
  const { startTime, endTime, maxWidth, fps } = options;
  const captureDuration = endTime - startTime;

  // 先算幀數，超過上限直接擋
  let frameCount = Math.ceil(captureDuration * fps);
  if (frameCount > MAX_FRAMES) {
    const maxSec = (MAX_FRAMES / fps).toFixed(1);
    throw new Error(
      `幀數過多（${frameCount} 幀），上限 ${MAX_FRAMES} 幀。\n請縮短範圍至 ${maxSec} 秒內，或降低幀率。`
    );
  }
  if (frameCount < 1) throw new Error('擷取範圍過短，請增加秒數或幀率');

  const frameDelay = 1000 / fps;

  // 同時載入 GIF 編碼器主程式和 Worker
  const [, workerBlobUrl] = await Promise.all([
    loadGifEncoder(),
    getWorkerBlobUrl(),
  ]);

  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    let renderTimer;
    let settled = false;

    const settle = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(renderTimer);
      fn();
    };

    video.onloadedmetadata = async () => {
      try {
        const scale = maxWidth > 0 ? Math.min(1, maxWidth / video.videoWidth) : 1;
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const gif = new GIF({
          workers: navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 4) : 2,
          quality: 10,
          width: canvas.width,
          height: canvas.height,
          workerScript: workerBlobUrl,
        });

        gif.on('finished', (blob) => {
          settle(() => {
            onProgress && onProgress(100);
            URL.revokeObjectURL(video.src);
            resolve({ blob, ext: '.gif', frames: frameCount });
          });
        });

        // gif.js 的 progress 事件：p 介於 0~1
        gif.on('progress', (p) => {
          if (onProgress) {
            // 把 GIF 編碼進度映射到 90~99%
            const pctValue = 90 + Math.round(p * 9);
            onProgress(Math.min(pctValue, 99));
          }
        });

        gif.on('error', (e) => {
          settle(() => {
            URL.revokeObjectURL(video.src);
            reject(e || new Error('GIF 編碼失敗'));
          });
        });

        // 逐幀擷取
        for (let i = 0; i < frameCount; i++) {
          const t = startTime + i / fps;
          await waitForSeek(video, t);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          gif.addFrame(canvas, { copy: true, delay: frameDelay });
          if (onProgress && i % 2 === 0) {
            onProgress(Math.min(Math.round((i / frameCount) * 88), 88));
          }
        }

        onProgress && onProgress(90);
        gif.render();

        // 渲染逾時保護
        renderTimer = setTimeout(() => {
          settle(() => {
            try { gif.abort && gif.abort(); } catch (_) {}
            URL.revokeObjectURL(video.src);
            reject(new Error(`GIF 編碼逾時（${RENDER_TIMEOUT / 1000} 秒），請降低幀數或解析度再試`));
          });
        }, RENDER_TIMEOUT);
      } catch (e) {
        settle(() => {
          URL.revokeObjectURL(video.src);
          reject(e);
        });
      }
    };

    video.onerror = () => {
      settle(() => {
        URL.revokeObjectURL(video.src);
        reject(new Error('無法載入影片'));
      });
    };

    video.src = URL.createObjectURL(file);
    video.playsInline = true;
    video.muted = true;
    video.preload = 'auto';
  });
};

export default { title, desc, icon, convert, formatSize, formatTime, PRESETS };
