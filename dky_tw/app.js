// 路由與工具配置（模組化）
import { tools } from './tools/index.js';

const ROUTES = {
  '/': 'home',
  '/qr': 'qr',
  '/color': 'color',
  '/json': 'json',
  '/base64': 'base64',
  '/diff': 'diff',
  '/jwt': 'jwt',
  '/pwd': 'pwd',
  '/url': 'url',
  '/text': 'text',
  '/tz': 'tz',
};

const renderFields = {
  home: () => `
      <div class="tool-grid">
        <div class="tool-card" onclick="location.hash='#/jwt'"><div class="icon">🔑</div><div class="label">JWT 解碼</div></div>
        <div class="tool-card" onclick="location.hash='#/pwd'"><div class="icon">🛡️</div><div class="label">密碼產生</div></div>
        <div class="tool-card" onclick="location.hash='#/url'"><div class="icon">🔗</div><div class="label">網址編解碼</div></div>
        <div class="tool-card" onclick="location.hash='#/text'"><div class="icon">📝</div><div class="label">文字處理</div></div>
        <div class="tool-card" onclick="location.hash='#/tz'"><div class="icon">🌍</div><div class="label">時區轉換</div></div>
        <div class="tool-card" onclick="location.hash='#/qr'"><div class="icon">📱</div><div class="label">QR Code</div></div>
        <div class="tool-card" onclick="location.hash='#/color'"><div class="icon">🎨</div><div class="label">顏色轉換</div></div>
        <div class="tool-card" onclick="location.hash='#/json'"><div class="icon">{}</div><div class="label">JSON 格式化</div></div>
        <div class="tool-card" onclick="location.hash='#/base64'"><div class="icon">📦</div><div class="label">Base64</div></div>
        <div class="tool-card" onclick="location.hash='#/diff'"><div class="icon">⚖️</div><div class="label">文字比對</div></div>
      </div>
  `,
  qr: () => `
    <div class="input-group">
      <label>內容</label>
      <input id="qr-input" placeholder="${tools.qr.placeholder || 'https://example.com'}" />
    </div>
    <button class="btn" onclick="UI.handleQR()">生成 QR Code</button>
    <div class="qr-wrap">
      <canvas id="qr-canvas" width="256" height="256"></canvas>
      <img id="qr-output" style="max-width:256px;border-radius:10px;border:1px solid var(--glass-border)" />
      <a id="qr-download" class="btn" download="qrcode.png">下載 PNG</a>
    </div>
  `,
  color: () => `
    <div class="input-group">
      <label>HEX</label>
      <input id="color-hex" placeholder="#00f2ff" />
    </div>
    <div class="input-group">
      <label>RGB</label>
      <div class="color-row">
        <input id="color-r" type="number" min="0" max="255" placeholder="R" />
        <input id="color-g" type="number" min="0" max="255" placeholder="G" />
        <input id="color-b" type="number" min="0" max="255" placeholder="B" />
      </div>
    </div>
    <button class="btn" onclick="UI.handleColor()">轉換</button>
    <div class="output" id="color-output"></div>
    <div class="color-swatch" id="color-preview" style="margin-top:8px;width:100px;height:32px"></div>
  `,
  json: () => `
    <div class="input-group">
      <label>JSON 字串</label>
      <textarea id="json-input" rows="6" placeholder='{"name":"DKY","tags":["web","tools"]}'></textarea>
    </div>
    <button class="btn" onclick="UI.handleJSON()">格式化</button>
    <div class="output" id="json-output"></div>
  `,
  base64: () => `
    <div class="input-group">
      <label>文字 / 檔案</label>
      <input id="base64-input" type="file" accept="*" />
    </div>
    <button class="btn" onclick="UI.handleBase64()">編碼</button>
    <button class="btn" onclick="UI.handleBase64Decode()">解碼</button>
    <div class="output" id="base64-output"></div>
    <a id="base64-download" class="btn" download>下載檔案</a>
  `,
  diff: () => `
    <div class="input-group">
      <label>原文 A</label>
      <textarea id="diff-a" rows="4" placeholder="第一行\n第二行"></textarea>
    </div>
    <div class="input-group">
      <label>比較 B</label>
      <textarea id="diff-b" rows="4" placeholder="第一行\n改為第二行"></textarea>
    </div>
    <button class="btn" onclick="UI.handleDiff()">比對</button>
    <div class="output" id="diff-output"></div>
  `,
  jwt: () => `
    <div class="input-group">
      <label>JWT Token</label>
      <textarea id="jwt-input" rows="4" placeholder="eyJhb..."></textarea>
    </div>
    <button class="btn" onclick="UI.handleJWT()">解碼 Payload</button>
    <div class="output" id="jwt-output"></div>
  `,
  pwd: () => `
    <div class="input-group">
      <label>密碼長度 (8~128)</label>
      <input id="pwd-len" type="number" value="16" min="8" max="128" />
    </div>
    <button class="btn" onclick="UI.handlePwd()">生成強密碼</button>
    <div class="output" id="pwd-output" style="font-size: 1.4rem; text-align: center; letter-spacing: 2px;"></div>
  `,
  url: () => `
    <div class="input-group">
      <label>網址或字串</label>
      <textarea id="url-input" rows="4" placeholder="輸入需要編碼的 %E6 字串或正常網址"></textarea>
    </div>
    <button class="btn" onclick="UI.handleURLEncode()">Encode / 編碼</button>
    <button class="btn" onclick="UI.handleURLDecode()">Decode / 解碼</button>
    <div class="output" id="url-output"></div>
  `,
  text: () => `
    <div class="input-group">
      <label>輸入文字</label>
      <textarea id="text-input" rows="6" placeholder="輸入要處理的文字..."></textarea>
    </div>
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px">
      <button class="btn" onclick="UI.handleTextCount()">字數統計</button>
      <button class="btn" onclick="UI.handleTextUpper()">全大寫 UPPER</button>
      <button class="btn" onclick="UI.handleTextLower()">全小寫 lower</button>
      <button class="btn" onclick="UI.handleTextTrim()">去頭尾空白</button>
    </div>
    <div class="output" id="text-output"></div>
  `,
  tz: () => `
    <div class="input-group">
      <label>選擇目標時區</label>
      <select id="tz-select">
        <option value="Asia/Tokyo">日本東京 (Asia/Tokyo)</option>
        <option value="America/New_York">美國紐約 (America/New_York)</option>
        <option value="Europe/London">英國倫敦 (Europe/London)</option>
        <option value="Asia/Taipei" selected>台灣台北 (Asia/Taipei)</option>
        <option value="Australia/Sydney">澳洲雪梨 (Australia/Sydney)</option>
        <option value="UTC">世界協調時間 (UTC)</option>
      </select>
    </div>
    <button class="btn" onclick="UI.handleTZ()">取得當地即時時間</button>
    <div class="output" id="tz-output" style="font-size: 1.2rem; text-align: center;"></div>
  `,
};

const UI = {
  handleQR() {
    const text = document.getElementById('qr-input').value.trim();
    if (!text) return alert('请输入内容或链接');
    tools.qr.generate(text).then((url) => {
      document.getElementById('qr-output').src = url;
      document.getElementById('qr-download').href = url;
    }).catch((e) => alert(e.message));
  },
  handleColor() {
    const h = document.getElementById('color-hex').value.trim();
    const r = parseInt(document.getElementById('color-r').value),
          g = parseInt(document.getElementById('color-g').value),
          b = parseInt(document.getElementById('color-b').value);
    const result = tools.color.convert({ hex: h, rgb: { r, g, b } });
    document.getElementById('color-output').textContent = JSON.stringify(result, null, 2);
    document.getElementById('color-preview').style.background = result.hex || '#0f0f13';
  },
  handleJSON() {
    const input = document.getElementById('json-input').value;
    try {
      const obj = JSON.parse(input);
      document.getElementById('json-output').textContent = JSON.stringify(obj, null, 2);
    } catch {
      alert('无效的 JSON');
    }
  },
  handleBase64() {
    const inp = document.getElementById('base64-input');
    if (!inp.files?.[0]) return alert('请选择文件');
    const reader = new FileReader();
    reader.onload = () => {
      const base = reader.result.split(',')[1] || reader.result;
      document.getElementById('base64-output').textContent = base;
    };
    reader.readAsDataURL(inp.files[0]);
  },
  handleBase64Decode() {
    const b64 = document.getElementById('base64-input').value.trim();
    try {
      const bin = atob(b64);
      const len = bin.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
      document.getElementById('base64-output').textContent = `data:application/octet-stream;base64,${b64}`;
      const a = document.getElementById('base64-download');
      a.href = document.getElementById('base64-output').textContent;
      a.download = 'decoded.bin';
    } catch { alert('Base64 格式错误'); }
  },
  handleDiff() {
    const a = document.getElementById('diff-a').value.split('\n');
    const b = document.getElementById('diff-b').value.split('\n');
    document.getElementById('diff-output').innerHTML = tools.diff?.compare(a, b) || '未实现';
  },
  handleJWT() {
    try {
      const token = document.getElementById('jwt-input').value.trim();
      const payload = token.split('.')[1];
      if (!payload) throw new Error();
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      document.getElementById('jwt-output').textContent = JSON.stringify(decoded, null, 2);
    } catch { alert('無效的 JWT 格式'); }
  },
  handlePwd() {
    const len = parseInt(document.getElementById('pwd-len').value) || 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const randomArray = new Uint32Array(len);
    window.crypto.getRandomValues(randomArray);
    let pwd = '';
    for (let i=0; i<len; i++) pwd += chars[randomArray[i] % chars.length];
    document.getElementById('pwd-output').textContent = pwd;
  },
  handleURLEncode() {
    const v = document.getElementById('url-input').value;
    document.getElementById('url-output').textContent = encodeURIComponent(v);
  },
  handleURLDecode() {
    const v = document.getElementById('url-input').value;
    try { document.getElementById('url-output').textContent = decodeURIComponent(v); }
    catch { alert('無效的 URL 編碼'); }
  },
  handleTextCount() {
    const v = document.getElementById('text-input').value;
    document.getElementById('text-output').textContent = \`總字數 (含空白/符號)：\${v.length}\n總字數 (去空白)：\${v.replace(/\\s/g,'').length}\`;
  },
  handleTextUpper() {
    const v = document.getElementById('text-input').value;
    document.getElementById('text-output').textContent = v.toUpperCase();
  },
  handleTextLower() {
    const v = document.getElementById('text-input').value;
    document.getElementById('text-output').textContent = v.toLowerCase();
  },
  handleTextTrim() {
    const v = document.getElementById('text-input').value;
    document.getElementById('text-output').textContent = v.trim();
  },
  handleTZ() {
    const tz = document.getElementById('tz-select').value;
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('zh-TW', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' });
    document.getElementById('tz-output').textContent = formatter.format(now);
  }
};

// 將 UI 掛載到全域環境，以利 HTML 內的 onclick 屬性呼叫
window.UI = UI;

// 路由分发
function renderRoute() {
  const hash = location.hash || '#/';
  const key = hash.replace('#', '') || '/';
  const route = ROUTES[key] || 'home';
  const app = document.getElementById('app');
  const metaList = {
    qr: { title: 'QR Code 產生', desc: '快速生成二維碼' },
    color: { title: '顏色轉換', desc: 'HEX/RGB/HSL 互轉' },
    json: { title: 'JSON 格式化', desc: '排版與驗證檢查' },
    base64: { title: 'Base64', desc: '文字與檔案編解碼' },
    diff: { title: '文字比對', desc: '尋找兩段文字的差異' },
    jwt: { title: 'JWT 解碼', desc: '解析 JSON Web Token Payload' },
    pwd: { title: '強密碼產生', desc: '藉由客戶端硬體亂數生成安全密碼' },
    url: { title: '網址編解碼', desc: 'URL Encode / Decode' },
    text: { title: '文字處理', desc: '字數統計與大小寫轉換' },
    tz: { title: '時區轉換', desc: '各國主要時區即時轉換' },
    home: { title: '功能首頁', desc: '選擇您需要的工具' }
  };
  const meta = metaList[route] || { title: '工具', desc: '' };

  app.innerHTML = `
    <div class="card">
      <h2>${meta.title}</h2>
      <p style="color:var(--muted);margin-top:4px">${meta.desc}</p>
      ${renderFields[route]?.() || '<p>页面未找到</p>'}
    </div>
  `;
  // 事件绑定
  if (route === 'qr') {
    if (typeof QRCode === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      s.onload = () => { console.log('QRCode 模組載入完成'); };
      document.head.appendChild(s);
    }
  }
  if (route === 'color') {
    ['color-hex','color-r','color-g','color-b'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => { document.getElementById('color-output').textContent=''; });
    });
  }
  if (route === 'diff') {
    ['diff-a','diff-b'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', UI.handleDiff);
    });
  }
  if (route === 'base64') {
    const inp = document.getElementById('base64-input');
    if (inp) inp.addEventListener('change', function () { UI.handleBase64(); });
  }
}

// 初始化
window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/';
  renderRoute();
});