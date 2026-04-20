// 啟動：註冊 Service Worker（若需要 PWA）並初始化路由
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// 啟動路由
document.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/';
});