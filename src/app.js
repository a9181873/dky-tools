// 路由與工具配置（模組化）
import * as tools from './tools/index.js';

const ROUTES = {
  '/': 'home',
  '/qr': 'qr',
  '/color': 'color',
  '/json': 'json',
  '/base64': 'base64',
  '/diff': 'diff',
  '/download': 'download',
  '/id': 'id'
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
      <input id="qr-input" placeholder="https://example.com" />
    </div>
    <button class="btn" id="qr-gen-btn" onclick="UI.handleQR()">生成 QR Code</button>
    <div class="qr-wrap">
      <div id="qr-status" style="color:var(--muted); font-size:0.8rem; display:none;">正在生成...</div>
      <img id="qr-output" style="max-width:100%; width:256px; border-radius:10px; border:1px solid var(--glass-border); display:none;" />
      <a id="qr-download" class="btn" style="display:none;" download="qrcode.png">下載 PNG</a>
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
  id: () => `
    <div style="background: rgba(255, 193, 7, 0.1); color: #FFC107; padding: 10px; border-radius: 6px; margin-bottom: 20px; font-size: 0.9rem;">
      <strong>⚠️ 警語</strong>: 本工具純粹依據官方數學邏輯隨機演算生成。產生的字號僅供「程式開發」與「系統測試」使用，有機率與真實字號巧合相同，切勿用於任何真實網站註冊或非法用途！
    </div>
    <div style="display:flex; gap: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; padding: 15px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(0,0,0,0.2);">
            <h3 style="margin-top:0;">✨ 隨機產生器</h3>
            <div class="input-group">
                <label>性別選項</label>
                <select id="id-gender" class="glass-input" style="width:100%;border-radius:6px;border:1px solid var(--glass-border);background:transparent;color:inherit;padding:8px;font-size:1rem;margin-bottom:8px;">
                    <option value="">隨機</option>
                    <option value="1">男性 (1)</option>
                    <option value="2">女性 (2)</option>
                    <option value="8">外國男 (8)</option>
                    <option value="9">外國女 (9)</option>
                </select>
            </div>
            <button class="btn" onclick="UI.handleIdGen()">抽出一組字號</button>
            <div class="output" id="id-gen-output" style="font-size: 1.5rem; text-align: center; letter-spacing: 3px; margin-top: 10px;">點擊產生</div>
        </div>
        
        <div style="flex: 1; min-width: 280px; padding: 15px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(0,0,0,0.2);">
            <h3 style="margin-top:0;">🛡️ 真偽驗證器</h3>
            <div class="input-group">
                <label>輸入身分證字號</label>
                <input id="id-val-input" placeholder="例如: A123456789" maxlength="10" />
            </div>
            <button class="btn" onclick="UI.handleIdVal()">驗證</button>
            <div class="output" id="id-val-output" style="text-align: center; margin-top: 10px;">等待驗證</div>
        </div>
    </div>
  `
};

const UI = {
  handleQR() {
    const text = document.getElementById('qr-input').value.trim();
    if (!text) return alert('请输入内容或链接');
    const out = document.getElementById('qr-output');
    const dl = document.getElementById('qr-download');
    const status = document.getElementById('qr-status');
    const btn = document.getElementById('qr-gen-btn');
    
    status.style.display = 'block';
    out.style.display = 'none';
    dl.style.display = 'none';
    btn.disabled = true;

    tools.qr.generate(text).then((url) => {
      out.src = url;
      out.style.display = 'block';
      dl.href = url;
      dl.style.display = 'inline-flex';
    }).catch((e) => {
      alert('產生失敗: ' + e.message);
    }).finally(() => {
      status.style.display = 'none';
      btn.disabled = false;
    });
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
  async handleDiff() {
    const a = document.getElementById('diff-a').value.split('\n');
    const b = document.getElementById('diff-b').value.split('\n');
    if (tools.diff?.compare) {
        document.getElementById('diff-output').innerHTML = '<span style="color:var(--muted)">比對中...</span>';
        try {
            document.getElementById('diff-output').innerHTML = await tools.diff.compare(a, b);
        } catch(e) {
            document.getElementById('diff-output').innerHTML = '比對錯誤: ' + e.message;
        }
    } else {
        document.getElementById('diff-output').innerHTML = '未實現';
    }
  },
  handleDownload() {
    const url = document.getElementById('dl-url').value.trim();
    document.getElementById('dl-output').textContent = `解析中... 建议格式: mp4-1080p, mp3-audio, jpg-thumbnail`;
  },
  handleIdGen() {
    const sel = document.getElementById('id-gender').value;
    const gender = sel ? sel : null;
    if (tools.id?.generate) {
      document.getElementById('id-gen-output').textContent = tools.id.generate(gender);
    } else {
      alert('產生器載入失敗');
    }
  },
  handleIdVal() {
    const val = document.getElementById('id-val-input').value;
    if (tools.id?.validate) {
      const result = tools.id.validate(val);
      const out = document.getElementById('id-val-output');
      if (result.valid) {
          out.innerHTML = `<span style="color:#4CAF50; font-weight:bold;">${result.msg}</span>`;
      } else {
          out.innerHTML = `<span style="color:#FF5252; font-weight:bold;">${result.msg}</span>`;
      }
    } else {
      alert('驗證器載入失敗');
    }
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