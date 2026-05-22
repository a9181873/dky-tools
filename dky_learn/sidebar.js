// Shared sidebar injection for DKY Learn
(function() {
  if (document.querySelector('.dky-sidebar')) return; // already injected
  
  const sidebarHTML = `
  <nav class="dky-sidebar sidebar">
    <div class="sidebar-header">
      <a href="/">📚 DKY 學習中心</a>
      <div class="sub">統計學習 · 機器學習 · Python</div>
    </div>
    <div class="sidebar-nav">
      <div class="section-title">📊 統計學習入門 (ISLP)</div>
      <a href="/statistics/02_What_Is_Statistical_Learning.html">§2.1 什麼是統計學習？</a>
      <a href="/statistics/02_Assessing_Model_Accuracy.html">§2.2 評估模型準確度</a>
      <a href="#" style="color:#8b949e;cursor:default">§2.3 Lab: Python 入門 <span class="badge">製作中</span></a>

      <div class="section-title" style="margin-top:1rem">🤖 機器學習</div>
      <a href="#" style="color:#8b949e;cursor:default">敬請期待</a>

      <div class="section-title" style="margin-top:1rem">🐍 Python</div>
      <a href="#" style="color:#8b949e;cursor:default">敬請期待</a>
    </div>
    <div class="sidebar-footer">
      <a href="https://tools.dky.tw">🔧 工具箱</a> · 
      <a href="https://use.dky.tw">🔐 工作台</a>
    </div>
  </nav>`;

  // Inject sidebar
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // Inject sidebar CSS
  const style = document.createElement('style');
  style.textContent = `
  .sidebar {
    width: 260px; background: #161b22; border-right: 1px solid #30363d;
    position: fixed; top: 0; left: 0; bottom: 0; overflow-y: auto; z-index: 100;
    display: flex; flex-direction: column;
  }
  .sidebar-header {
    padding: 1.2rem 1rem; border-bottom: 1px solid #30363d;
    font-weight: 700; font-size: 1rem; color: #f0f6fc;
  }
  .sidebar-header a { color: inherit; text-decoration: none; }
  .sidebar-header .sub { font-size: 0.75rem; color: #8b949e; font-weight: 400; }
  .sidebar-nav { flex: 1; padding: 0.8rem 0; }
  .sidebar-nav .section-title {
    padding: 0.4rem 1rem; font-size: 0.7rem; text-transform: uppercase;
    letter-spacing: 0.05em; color: #8b949e;
  }
  .sidebar-nav a {
    display: block; padding: 0.4rem 1rem 0.4rem 1.4rem; font-size: 0.88rem;
    color: #c9d1d9; text-decoration: none; border-left: 2px solid transparent;
    transition: all 0.15s;
  }
  .sidebar-nav a:hover { color: #f0f6fc; background: #1f6feb33; border-left-color: #58a6ff; }
  .sidebar-nav a .badge {
    float: right; font-size: 0.7rem; background: #1a2f1a; color: #3fb950;
    padding: 0.1rem 0.4rem; border-radius: 0.5rem;
  }
  .sidebar-footer {
    padding: 0.8rem 1rem; border-top: 1px solid #30363d;
    font-size: 0.75rem; color: #8b949e;
  }
  .sidebar-footer a { color: #58a6ff; }
  body { margin-left: 260px; }
  @media (max-width: 768px) {
    .sidebar { display: none; }
    body { margin-left: 0; }
  }
  `;
  document.head.appendChild(style);
})();
