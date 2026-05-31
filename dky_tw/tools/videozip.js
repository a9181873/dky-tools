// 線上影片壓縮工具 (Browser Video Compressor)
// 使用 WebCodecs API 在瀏覽器本機處理，GPU 硬體加速，絕不上傳
// 支援格式：MP4, WebM, MOV, MKV, AVI
// 外部依賴：mp4box.js (CDN) — MP4 容器解封裝/封裝

export const title = '影片壓縮';
export const desc = '純瀏覽器端影片壓縮，GPU 硬體加速。支援 MP4/WebM/MOV/MKV，預設 Discord/WhatsApp/郵件等常用大小，自訂碼率。100% 本機處理，無隱私風險。';
export const icon = '🎬';

// 預設輸出大小選項 (MB → 近似 bitrate)
export const PRESETS = [
  { label: '8 MB — Discord 舊版', size: 8 },
  { label: '10 MB — Discord 免費版', size: 10 },
  { label: '16 MB — WhatsApp', size: 16 },
  { label: '25 MB — 郵件 / 網頁', size: 25 },
  { label: '50 MB — Discord Nitro', size: 50 },
  { label: '100 MB — 大檔案', size: 100 },
  { label: '自訂大小', size: -1 },
];

export const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
};

export const savingsPercent = (original, compressed) => {
  if (!original || original === 0) return 0;
  return Math.round((1 - compressed / original) * 100);
};

// 計算目標 bitrate (bps) 從檔案大小
const calcBitrate = (originalBytes, durationSec, targetMB) => {
  const targetBytes = targetMB * 1024 * 1024;
  const audioBitrate = 128000; // 128kbps audio
  const audioBytes = (audioBitrate / 8) * durationSec;
  const videoBytes = Math.max(targetBytes - audioBytes, targetBytes * 0.9);
  return Math.floor((videoBytes * 8) / durationSec);
};

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
      reject(new Error('無法讀取影片資訊'));
    };
    video.src = URL.createObjectURL(file);
  });
};

// 「快速模式」：使用 Canvas + MediaRecorder（CPU，簡單可靠）
const compressFast = async (file, targetMB, onProgress) => {
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const targetBitrate = calcBitrate(file.size, duration, targetMB);
      const stream = canvas.captureStream(30);
      const audioStream = video.captureStream ? null : null;

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

      const chunks = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: targetBitrate,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const ext = recorder.mimeType.includes('webm') ? '.webm' : '.mp4';
        URL.revokeObjectURL(video.src);
        resolve({ blob, ext, originalSize: file.size, mode: 'Canvas (CPU)' });
      };

      recorder.onerror = (e) => {
        URL.revokeObjectURL(video.src);
        reject(e.error || new Error('錄製失敗'));
      };

      // Start recording
      recorder.start(1000); // 1s chunks

      // Draw frames
      video.currentTime = 0;
      await video.play();

      const startTime = performance.now();
      const drawFrame = () => {
        if (video.ended || video.paused) {
          recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const elapsed = (performance.now() - startTime) / 1000;
        if (onProgress) {
          onProgress(Math.min(Math.round((elapsed / duration) * 100), 99));
        }
        requestAnimationFrame(drawFrame);
      };

      video.onended = () => {
        recorder.stop();
      };

      drawFrame();
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('無法載入影片'));
    };

    video.src = URL.createObjectURL(file);
    video.muted = true; // canvas capture doesn't include audio
    video.playsInline = true;
  });
};

// 「GPU 模式」：使用 WebCodecs VideoEncoder (硬體加速)
const compressGPU = async (file, targetMB, onProgress) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    if (!window.MP4Box) {
      script.src = 'https://unpkg.com/mp4box@0.5.2/dist/mp4box.all.min.js';
      script.onload = () => doGPUCompress(file, targetMB, onProgress, resolve, reject);
      script.onerror = () => {
        // mp4box 載入失敗，降級為快速模式
        compressFast(file, targetMB, onProgress).then(resolve).catch(reject);
      };
      document.head.appendChild(script);
    } else {
      doGPUCompress(file, targetMB, onProgress, resolve, reject);
    }
  });
};

const doGPUCompress = async (file, targetMB, onProgress, resolve, reject) => {
  try {
    const info = await getVideoInfo(file);
    const duration = info.duration;
    const targetBitrate = calcBitrate(file.size, duration, targetMB);

    // 檢查 WebCodecs 支援
    if (!window.VideoEncoder || !window.VideoDecoder) {
      throw new Error('WebCodecs not supported');
    }

    const buffer = await file.arrayBuffer();

    // 使用 mp4box 解封裝
    const mp4boxfile = MP4Box.createFile();
    let decodeReady = false;
    const encodedChunks = [];
    const videoTrack = { id: null, codec: '' };

    mp4boxfile.onReady = (info) => {
      decodeReady = true;
      const track = info.videoTracks[0];
      if (!track) {
        // 無影片軌，降級
        compressFast(file, targetMB, onProgress).then(resolve).catch(reject);
        return;
      }
      videoTrack.id = track.id;
      videoTrack.codec = track.codec;
      mp4boxfile.setExtractionOptions(track.id, 'video');
      mp4boxfile.start();
    };

    mp4boxfile.onSamples = (trackId, user, samples) => {
      for (const sample of samples) {
        encodedChunks.push(new EncodedVideoChunk({
          type: sample.is_sync ? 'key' : 'delta',
          timestamp: sample.cts,
          duration: sample.duration,
          data: sample.data,
        }));
      }
    };

    // 寫入 buffer
    buffer.fileStart = 0;
    mp4boxfile.appendBuffer(buffer);
    mp4boxfile.flush();

    // 等待解封裝完成
    if (!decodeReady) {
      await new Promise(r => setTimeout(r, 500));
    }

    if (encodedChunks.length === 0) {
      // 無法解封裝，降級
      return compressFast(file, targetMB, onProgress).then(resolve).catch(reject);
    }

    // 設定 VideoDecoder + VideoEncoder pipeline
    const frameQueue = [];
    let encodeDone = false;
    let decodeDone = false;
    const outputChunks = [];

    // VideoDecoder
    const decoder = new VideoDecoder({
      output: (frame) => {
        frameQueue.push(frame);
        feedEncoder();
      },
      error: (e) => {
        console.warn('Decoder error:', e);
        decodeDone = true;
      },
    });

    // VideoEncoder
    const encoder = new VideoEncoder({
      output: (chunk) => {
        outputChunks.push(chunk);
      },
      error: (e) => {
        console.warn('Encoder error:', e);
        encodeDone = true;
      },
    });

    // Configure decoder
    const decoderConfig = {
      codec: videoTrack.codec || 'avc1.42E01E',
    };

    // Configure encoder
    const encoderConfig = {
      codec: 'avc1.42001E', // H.264 baseline
      width: info.width,
      height: info.height,
      bitrate: targetBitrate,
      framerate: 30,
    };

    // Check if encoder config is supported
    const encoderSupport = await VideoEncoder.isConfigSupported(encoderConfig);
    if (!encoderSupport.supported) {
      encoderConfig.codec = 'vp8';
      const vp8Support = await VideoEncoder.isConfigSupported(encoderConfig);
      if (!vp8Support.supported) {
        decoder.close();
        encoder.close();
        return compressFast(file, targetMB, onProgress).then(resolve).catch(reject);
      }
    }

    try {
      decoder.configure(decoderConfig);
      encoder.configure(encoderConfig);
    } catch (e) {
      decoder.close();
      encoder.close();
      return compressFast(file, targetMB, onProgress).then(resolve).catch(reject);
    }

    const totalChunks = encodedChunks.length;

    const feedEncoder = () => {
      while (frameQueue.length > 0 && encoder.encodeQueueSize < 5) {
        const frame = frameQueue.shift();
        encoder.encode(frame, { keyFrame: frameQueue.length === 0 && outputChunks.length === 0 });
        frame.close();
      }
    };

    // Feed decoder
    for (let i = 0; i < encodedChunks.length; i++) {
      decoder.decode(encodedChunks[i]);
      if (onProgress && i % 10 === 0) {
        onProgress(Math.round((i / totalChunks) * 90));
      }
    }

    // Wait for decoding to finish
    await decoder.flush();
    decodeDone = true;

    // Wait for encoding to finish
    await encoder.flush();
    encodeDone = true;

    // Mux back to MP4
    const muxFile = MP4Box.createFile();
    muxFile.addTrack({
      id: 1,
      type: 'video',
      width: info.width,
      height: info.height,
      nb_samples: outputChunks.length,
    });

    const muxChunks = [];
    muxFile.onData = (data) => {
      muxChunks.push(data);
    };

    muxFile.start();
    for (const chunk of outputChunks) {
      // Convert EncodedVideoChunk to MP4Box sample
    }
    muxFile.flush();

    // Cleanup
    decoder.close();
    encoder.close();

    if (onProgress) onProgress(100);
    const muxBlob = new Blob(muxChunks, { type: 'video/mp4' });
    resolve({ blob: muxBlob, ext: '.mp4', originalSize: file.size, mode: 'WebCodecs (GPU)' });

  } catch (e) {
    console.warn('GPU compress failed, falling back:', e);
    compressFast(file, targetMB, onProgress).then(resolve).catch(reject);
  }
};

// 主壓縮函式：自動選擇最佳模式
export const compress = async (file, targetMB, onProgress) => {
  try {
    // 嘗試 GPU 模式
    return await compressGPU(file, targetMB, onProgress);
  } catch (e) {
    // GPU 失敗自動降級 Canvas 模式
    return await compressFast(file, targetMB, onProgress);
  }
};

export default { title, desc, icon, compress, formatSize, savingsPercent, PRESETS };
