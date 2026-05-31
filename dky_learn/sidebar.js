// DKY Learn — shared sidebar injection
(function() {
  if (document.querySelector('.dky-sidebar')) return;
  
  const path = window.location.pathname;
  
  const sidebarHTML = `
  <nav class="dky-sidebar sidebar">
    <div class="sidebar-header">
      <a href="/">📚 DKY 學習中心</a>
      <div class="sub">統計學習 · 機器學習 · Python</div>
    </div>
    <div class="sidebar-nav">
      <div class="section-title">
        統計學習入門 (ISLP)
        <a href="/ISLP_textbook.pdf" class="textbook-link" title="下載課本 PDF">📖</a>
      </div>
      <span class="nav-item done">2.1 什麼是統計學習？</span>
      <span class="nav-item done">2.2 評估模型準確度</span>
      <span class="nav-item pending">2.3 Lab: Python 入門</span>
      <span class="nav-item done">3.1 簡單線性迴歸</span>
      <span class="nav-item done">3.2 多元線性迴歸</span>
      <span class="nav-item done">3.3 迴歸模型的其他考量</span>
      <span class="nav-item pending">3.4 行銷計畫</span>

      <div class="section-title" style="margin-top:1.2rem">機器學習 <span class="coming">即將推出</span></div>

      <div class="section-title" style="margin-top:0.8rem">Python <span class="coming">即將推出</span></div>

      <div class="section-title" style="margin-top:0.8rem">論文研究</div>
      <a href="/research/" class="nav-item-link">Agentic Boosting Weak Models</a>
    </div>
    <div class="sidebar-footer">
      <a href="https://tools.dky.tw">工具箱</a>
      <a href="https://use.dky.tw">工作台</a>
    </div>
  </nav>`;

  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  const style = document.createElement('style');
  style.textContent = `
  .sidebar {
    width: 240px; background: #161b22; border-right: 1px solid #30363d;
    position: fixed; top: 0; left: 0; bottom: 0; overflow-y: auto; z-index: 100;
    display: flex; flex-direction: column;
  }
  .sidebar-header {
    padding: 1.2rem 1rem; border-bottom: 1px solid #30363d;
    font-weight: 700; font-size: 1rem; color: #f0f6fc;
  }
  .sidebar-header a { color: inherit; text-decoration: none; }
  .sidebar-header .sub { font-size: 0.72rem; color: #8b949e; font-weight: 400; }
  .sidebar-nav { flex: 1; padding: 0.8rem 0; }
  .sidebar-nav .section-title {
    padding: 0.5rem 1rem 0.3rem; font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.04em; color: #8b949e; display: flex; align-items: center; gap: 0.5rem;
  }
  .textbook-link {
    font-size: 0.85rem; text-decoration: none; opacity: 0.6; transition: opacity 0.15s;
  }
  .textbook-link:hover { opacity: 1; }
  .nav-item {
    display: block; padding: 0.35rem 1rem 0.35rem 1.5rem; font-size: 0.84rem;
    color: #484f58; border-left: 2px solid transparent;
  }
  .nav-item.done { color: #8b949e; }
  .nav-item.pending { color: #d2991d; }
  .nav-item.future { color: #484f58; }
  .nav-item.done::before { content: "✓ "; color: #3fb950; font-size: 0.7rem; }
  .nav-item.pending::before { content: "○ "; color: #d2991d; font-size: 0.7rem; }
  .nav-item.future::before { content: "· "; color: #484f58; }
  .nav-item-link {
    display: block; padding: 0.35rem 1rem 0.35rem 1.5rem; font-size: 0.84rem;
    color: #58a6ff; border-left: 2px solid transparent; text-decoration: none;
  }
  .nav-item-link:hover { border-left-color: #58a6ff; background: rgba(88,166,255,0.05); }
  .coming { font-size: 0.65rem; color: #484f58; font-weight: 400; text-transform: none; }
  .sidebar-footer {
    padding: 0.8rem 1rem; border-top: 1px solid #30363d;
    font-size: 0.75rem; color: #8b949e; display: flex; gap: 0.8rem;
  }
  .sidebar-footer a { color: #58a6ff; text-decoration: none; }
  .sidebar-footer a:hover { text-decoration: underline; }
  body { margin-left: 240px; }
  @media (max-width: 768px) {
    .sidebar { display: none; }
    body { margin-left: 0; }
  }
  `;
  document.head.appendChild(style);
})();
