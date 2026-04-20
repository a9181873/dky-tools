// 路由與工具配置（模組化）
import { tools } from './tools/index.js';

const ROUTES = {
  '/': 'download',
  '/download': 'download',
};

const renderFields = {
  home: () => `
    <div class="tool-grid">
      ${Object.entries(tools).map(([k, t]) => `
        <div class="tool-card" onclick="location.hash='#/${k}'">
          <div class="icon">📋</div>
          <div class="label">${t.title}</div>
        </div>
      `).join('')}
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
  download: () => `
    <div class="input-group">
      <label>影片連結 (YouTube / IG / X)</label>
      <input id="dl-url" placeholder="https://www.youtube.com/watch?v=..." />
    </div>
    <button class="btn" onclick="UI.handleDownload()">解析</button>
    <div class="output" id="dl-output"></div>
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
  handleDownload() {
    const url = document.getElementById('dl-url').value.trim();
    document.getElementById('dl-output').textContent = `解析中... 建议格式: mp4-1080p, mp3-audio, jpg-thumbnail`;
  },
};

// 將 UI 掛載到全域環境，以利 HTML 內的 onclick 屬性呼叫
window.UI = UI;

// 路由分发
function renderRoute() {
  const hash = location.hash || '#/';
  const key = hash.replace('#', '') || '/';
  const route = ROUTES[key] || 'home';
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <h2>${tools[route]?.title || '工具'}</h2>
      <p style="color:var(--muted);margin-top:4px">${tools[route]?.desc || ''}</p>
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