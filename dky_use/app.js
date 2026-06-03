/* DKY 私人工作台 — use.dky.tw
 * 密碼保護 + IDEA Box + 美股投資組合追蹤
 */
import * as tools from './tools/index.js';

// ── 密碼系統 ──
const PASSWORD_HASH = 'bcd67b59cd18fdd2c7e4675c46e0126a3d6cacdf4811263e8c3725436f3c4fb2'; // "611118"
window.__AUTH_TOKEN = PASSWORD_HASH;

async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

let authenticated = sessionStorage.getItem('dky_use_auth') === '1';

function showSite(show) {
  document.getElementById('site-header').style.display = show ? '' : 'none';
  document.getElementById('site-footer').style.display = show ? '' : 'none';
}

// ── 路由 ──
const ROUTES = { '/': 'home', '/ideabox': 'ideabox', '/usstocks': 'usstocks', '/python-lab': 'pythonlab' };

const metaList = {
  home: { title: '', desc: '' },
  ideabox: { icon: '💡', title: 'IDEA Box 提案產生器', desc: '輸入構想與單位，一鍵整理成清楚可讀的提案書，輸出內容不含 Markdown 符號。' },
  usstocks: { icon: '📈', title: '美股投資組合追蹤', desc: '個人買入、賣出、配息紀錄，自動計算未實現與已實現報酬。' },
  pythonlab: { icon: '🐍', title: 'Lab: Python 入門', desc: 'NumPy、pandas、matplotlib 基礎操作，ISLP 課本 2.3 節實作筆記。' },
};

// ── 工具函數 ──
function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function renderError(msg) {
  return `<div class="idea-empty" style="color:var(--red)">❌ ${escapeHTML(String(msg))}</div>`;
}

const renderFields = {
  home: () => {
    const dashMeta = [
      { key: 'ideabox', icon: '💡', title: 'IDEA Box 提案產生器', desc: '一鍵生成保險創新提案書，含決策分析表格，支援複製純文字與下載 Word。' },
      { key: 'usstocks', icon: '📈', title: '美股投資組合追蹤', desc: '用買入、賣出、配息三個動作記個人帳本，支援多帳戶、股價更新與 CSV 備份。' },
      { key: 'python-lab', icon: '🐍', title: 'Lab: Python 入門', desc: 'NumPy、pandas、matplotlib 基礎操作，ISLP 課本 2.3 節實作筆記。' },
    ];
    return `<div class="tool-grid">
      ${dashMeta.map(m => `<div class="tool-card" onclick="UI.navigate('/${m.key}')">
        <div class="icon">${m.icon}</div><div class="label">${m.title}</div>
        <div class="desc">${m.desc}</div>
      </div>`).join('')}
    </div>`;
  },

  ideabox: () => `
    <div class="ideabox-grid">
      <section class="ideabox-panel">
        <div class="input-group"><label>提案單位</label><select id="idea-company"><option value="台灣人壽">台灣人壽</option><option value="中信產險">中信產險</option></select></div>
        <div class="input-group"><label>部門名稱</label><input id="idea-department" placeholder="例如：資訊處" /></div>
        <div class="input-group"><label>團隊成員</label><input id="idea-members" placeholder="姓名 / 部門" /></div>
        <div class="input-group"><label>提案名稱</label><input id="idea-title" placeholder="請輸入提案名稱" /></div>
        <div class="input-group"><label>應用構面</label><select id="idea-dimension"><option value="公平待客">公平待客</option><option value="業績提升">業績提升</option><option value="流程優化" selected>流程優化</option><option value="專業知能">專業知能</option></select></div>
        <div class="input-group"><label>決策分析方式</label><select id="idea-analysis-type"><option value="可行性分析" selected>可行性分析</option><option value="成本效益分析">成本效益分析</option><option value="風險與因應分析">風險與因應分析</option><option value="5W1H分析">5W1H 分析</option><option value="KPI指標分析">KPI 指標分析</option><option value="使用者旅程分析">使用者旅程分析</option><option value="優缺點清單">優缺點清單</option><option value="比較表格">比較表格</option><option value="SWOT分析">SWOT 分析</option></select></div>
        <div class="input-group"><label>構想說明</label><textarea id="idea-content" rows="7" placeholder="請描述想解決的問題、初步構想、可能使用 AI 的方式與期待成效。"></textarea></div>
        <button class="btn" onclick="UI.handleIdeaBoxGenerate()" id="idea-generate-btn">生成提案書</button>
      </section>
      <section class="ideabox-preview">
        <div class="ideabox-actions">
          <button class="btn" onclick="UI.copyIdeaBox()" id="idea-copy-btn" disabled>複製純文字</button>
          <button class="btn" onclick="UI.downloadIdeaBoxDoc()" id="idea-download-btn" disabled>下載 Word</button>
        </div>
        <div id="idea-output" class="idea-document">
          <div class="idea-empty">填寫左側資料後，這裡會產生可直接閱讀與再編修的 IDEA Box 提案書。</div>
        </div>
      </section>
    </div>
  `,

  usstocks: () => tools.usstocks.render(),
  pythonlab: () => tools.pythonlab.render(),
};

// ── Navigation ──
const Nav = {
  update(route) {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    nav.innerHTML = `
      <a href="/" class="nav-link${route==='home'?' active':''}" onclick="UI.navigate('/');return false">首頁</a>
      <a href="/ideabox" class="nav-link${route==='ideabox'?' active':''}" onclick="UI.navigate('/ideabox');return false">IDEA Box</a>
      <a href="/usstocks" class="nav-link${route==='usstocks'?' active':''}" onclick="UI.navigate('/usstocks');return false">📈 美股追蹤</a>
    `;
  }
};

// ── UI ──
const UI = {
  navigate(path) {
    history.pushState(null, '', path);
    renderRoute();
  },

  getIdeaForm() {
    return {
      company: document.getElementById('idea-company')?.value || '台灣人壽',
      department: (document.getElementById('idea-department')?.value || '').trim(),
      members: (document.getElementById('idea-members')?.value || '').trim(),
      title: (document.getElementById('idea-title')?.value || '').trim(),
      dimension: document.getElementById('idea-dimension')?.value || '流程優化',
      analysisType: document.getElementById('idea-analysis-type')?.value || '可行性分析',
      idea: (document.getElementById('idea-content')?.value || '').trim(),
    };
  },

  async handleIdeaBoxGenerate() {
    const form = this.getIdeaForm();
    if (!form.title || !form.idea) return alert('請至少填寫提案名稱與構想說明');

    const btn = document.getElementById('idea-generate-btn');
    btn.disabled = true;
    btn.textContent = 'AI 生成中...';

    const output = document.getElementById('idea-output');
    output.innerHTML = '<div class="idea-empty">🤖 正在生成提案書，請稍候...</div>';

    try {
      const resp = await fetch('/api/ideabox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        output.innerHTML = renderError(err.error || '伺服器錯誤');
        btn.disabled = false; btn.textContent = '生成提案書';
        return;
      }
      const payload = await resp.json();
      let data = tools.ideabox.normalizeGeneratedIdea(payload, form);

      window.ideaBoxData = data;
      window.ideaBoxHtml = tools.ideabox.buildIdeaBoxHtml(data);
      window.ideaBoxPlainText = tools.ideabox.buildIdeaBoxPlainText(data);
      output.innerHTML = window.ideaBoxHtml;
      document.getElementById('idea-copy-btn').disabled = false;
      document.getElementById('idea-download-btn').disabled = false;
    } catch (e) {
      output.innerHTML = renderError(`網路錯誤：${e.message}`);
    }
    btn.disabled = false;
    btn.textContent = '生成提案書';
  },

  async copyIdeaBox() {
    if (!window.ideaBoxPlainText) return;
    try {
      await navigator.clipboard.writeText(window.ideaBoxPlainText);
      const btn = document.getElementById('idea-copy-btn');
      const orig = btn.textContent;
      btn.textContent = '✓ 已複製';
      setTimeout(() => btn.textContent = orig, 2000);
    } catch { alert('複製失敗，請手動複製'); }
  },

  downloadIdeaBoxDoc() {
    if (!window.ideaBoxData) return;
    const blob = tools.ideabox.buildIdeaBoxDocxBlob(window.ideaBoxData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(window.ideaBoxData.title||'提案書').replace(/[\\/:*?"<>|]/g,'_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

window.UI = UI;

// ── 路由渲染 ──
let tzTimer = null;

function renderRoute() {
  if (!authenticated) { renderPasswordGate(); return; }
  showSite(true);

  const path = location.pathname;
  let route = ROUTES[path] || 'home';
  const app = document.getElementById('app');
  app.classList.toggle('wide-page', route === 'ideabox' || route === 'usstocks' || route === 'pythonlab');

  const meta = metaList[route] || { title: '', desc: '' };
  const title = meta.title ? `<h2>${meta.title}</h2><p style="color:var(--text-muted);margin-top:4px;margin-bottom:16px">${meta.desc}</p>` : '';

  Nav.update(route);

  app.innerHTML = `<div class="card">${title}${renderFields[route]?.() || '<p>頁面未找到</p>'}</div>`;

  if (route === 'usstocks') {
    if (tools.usstocks && tools.usstocks.init) tools.usstocks.init();
  } else {
    if (tzTimer) { clearInterval(tzTimer); tzTimer = null; }
  }
}

// ── 密碼門 ──
function renderPasswordGate() {
  showSite(false);
  document.getElementById('app').innerHTML = `
    <div class="pwd-gate card">
      <div class="icon">🔐</div>
      <h3>DKY 私人工作台</h3>
      <p class="hint">請輸入密碼以存取工具</p>
      <div class="input-group">
        <input id="pwd-input" type="password" placeholder="輸入密碼" style="text-align:center" />
      </div>
      <button class="btn" id="pwd-btn" style="width:100%">解鎖</button>
      <p class="error" id="pwd-error">密碼錯誤，請重試</p>
    </div>
  `;

  const input = document.getElementById('pwd-input');
  const btn = document.getElementById('pwd-btn');
  const err = document.getElementById('pwd-error');

  let attempts = 0;
  let locked = false;

  const tryLogin = async () => {
    if (locked) return;
    const hash = await sha256(input.value);
    if (hash === PASSWORD_HASH) {
      attempts = 0;
      authenticated = true;
      sessionStorage.setItem('dky_use_auth', '1');
      history.replaceState(null, '', '/');
      renderRoute();
    } else {
      attempts++;
      input.value = '';
      if (attempts >= 5) {
        locked = true;
        btn.disabled = true;
        err.textContent = '密碼錯誤次數過多，請等待 60 秒後再試';
        err.style.display = 'block';
        setTimeout(() => {
          locked = false;
          attempts = 0;
          btn.disabled = false;
          err.textContent = '密碼錯誤，請重試';
          err.style.display = 'none';
          input.focus();
        }, 60000);
      } else {
        err.textContent = '密碼錯誤，請重試';
        err.style.display = 'block';
        if (attempts >= 3) {
          btn.disabled = true;
          setTimeout(() => { btn.disabled = false; input.focus(); }, (attempts - 2) * 2000);
        } else {
          input.focus();
        }
      }
    }
  };
  btn.onclick = tryLogin;
  input.onkeydown = (e) => { if (e.key === 'Enter') tryLogin(); };
  setTimeout(() => input.focus(), 100);
}

// ── 初始化 ──
window.addEventListener('popstate', renderRoute);
window.addEventListener('DOMContentLoaded', () => {
  if (location.hash.startsWith('#/')) {
    history.replaceState(null, '', location.hash.replace('#', ''));
  }
  renderRoute();
});
