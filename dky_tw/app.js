// 路由與工具配置（模組化）
import * as tools from './tools/index.js';

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
  '/hash': 'hash',
  '/css': 'css',
  '/regex': 'regex'
};

const metaList = {
  qr: { icon: '📱', title: 'QR Code 產生', desc: '輸入任意網址或文字，立刻生成無廣告、可直接下載列印的高解析度 QR Code，適合店家或行銷使用。' },
  json: { icon: '{}', title: 'JSON 格式整理', desc: '當拿到一大串擠在一起的 {} 程式亂碼時，點擊就能瞬間幫你排版成有縮排、有顏色的完美格式，還能揪出哪裡少打引號！' },
  color: { icon: '🎨', title: '色彩代碼轉換', desc: '設計師專用！如果你拿到色號 #00F2FF 卻不知道 RGB 是多少，貼上即可算出所有的色彩代碼 (HEX/RGB/HSL)。' },
  base64: { icon: '📦', title: 'Base64 加解密', desc: '可以把任何文字，或者直接將「圖片檔案」拖曳進來，編碼成亂碼文字方便藏在網頁碼裡，也能隨時無損還原。' },
  diff: { icon: '⚖️', title: '左右文字比對', desc: '當你有兩段差不多長的文章或程式碼時，貼上來它會像改錯字一樣，把「多出來」或「刪掉」的地方用紅綠色標出來！' },
  jwt: { icon: '🔑', title: 'JWT Token 解密', desc: '開發者必備：拿到一串 "eyJ" 開頭的登入亂碼通行證時，貼上來即可解析出裡面藏的過期時間或 ID，純本地運算超安全。' },
  pwd: { icon: '🛡️', title: '安全密碼產生', desc: '需要超複雜密碼？這個工具啟用你電腦 CPU 最底層的硬體亂數引擎，生成駭客也猜不到的高強度隨機密碼！' },
  url: { icon: '🔗', title: '網址亂碼還原', desc: '複製中文網址常變成 "%E6%B8%AC" 這種超長亂碼，透過「解碼」就能還原成看得懂的中文；當然也能反向「編碼」。' },
  text: { icon: '📝', title: '文字排版助手', desc: '報告寫了多少字？瞬間幫你結算含空白、去空白的字數；還能一鍵將英文全部轉大寫，或刪除多餘空白。' },
  tz: { icon: '🌍', title: '跨國時區即時算', desc: '常常要跟外國客戶開通話？打開它，立刻為你換算目前東京、紐約、倫敦的準確當地時間。' },
  hash: { icon: '🔒', title: '加密雜湊 (Hash)', desc: '將任何明文轉換為不可逆的 SHA-256 / SHA-1 加密字串，不透過伺服器，最高規格保護密碼隱私。' },
  css: { icon: '✨', title: 'CSS 視覺產生', desc: '不再死背語法！拉動滑桿即時在畫面上預覽立體陰影 (Box-Shadow)，滿意後直接點擊複製 CSS 給前端貼上。' },
  regex: { icon: '🔎', title: '正則表達測試', desc: '寫程式檢查 Email 格式最頭痛。輸入表達式，它會在下方文章中即時把配對到的字高亮標示出來。' }
};

const renderFields = {
  home: () => `
    <div class="tool-grid">
      ${Object.entries(metaList).map(([k, meta]) => `
        <div class="tool-card" onclick="UI.navigate('/${k}')">
          <div class="icon">${meta.icon}</div><div class="label">${meta.title}</div>
          <div style="font-size:0.8rem; color:var(--muted); margin-top:8px; line-height:1.4">${meta.desc}</div>
        </div>
      `).join('')}
    </div>
  `,
  qr: () => `
    <div class="input-group">
      <label>內容</label>
      <input id="qr-input" placeholder="https://example.com" />
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
    <div class="output" id="color-output" style="font-family: monospace; white-space: pre-wrap;"></div>
    <div class="color-swatch" id="color-preview" style="margin-top:8px;width:100px;height:32px"></div>
  `,
  json: () => `
    <div class="input-group">
      <label>JSON 字串</label>
      <textarea id="json-input" rows="6" placeholder='{"name":"DKY","tags":["web","tools"]}'></textarea>
    </div>
    <button class="btn" onclick="UI.handleJSON()">格式化</button>
    <div class="output" id="json-output" style="white-space: pre-wrap; font-family: monospace;"></div>
  `,
  base64: () => `
    <div class="input-group">
      <label>文字 / 檔案</label>
      <input id="base64-input" type="file" accept="*" />
    </div>
    <button class="btn" onclick="UI.handleBase64()">編碼檔案</button>
    <div class="input-group" style="margin-top:10px">
      <textarea id="base64-txt" rows="4" placeholder="在此輸入文字進行Base64編解碼..."></textarea>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" onclick="UI.handleBase64Txt('enc')">文字編碼</button>
      <button class="btn" onclick="UI.handleBase64Txt('dec')">文字解碼</button>
    </div>
    <div class="output" id="base64-output" style="word-break: break-all;"></div>
    <a id="base64-download" class="btn" style="display:none" download>下載檔案</a>
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
    <div class="output" id="diff-output" style="font-family: monospace; white-space: pre-wrap;"></div>
  `,
  jwt: () => `
    <div class="input-group">
      <label>JWT Token</label>
      <textarea id="jwt-input" rows="4" placeholder="eyJhb..."></textarea>
    </div>
    <button class="btn" onclick="UI.handleJWT()">解碼 Payload</button>
    <div class="output" id="jwt-output" style="font-family: monospace; white-space: pre-wrap;"></div>
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
    <div class="output" id="url-output" style="word-break: break-all;"></div>
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
    <div class="output" id="text-output" style="white-space: pre-wrap;"></div>
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
  hash: () => `
    <div class="input-group">
      <label>輸入明文文字</label>
      <textarea id="hash-input" rows="4" placeholder="在此輸入需要加密的文字..."></textarea>
    </div>
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px">
      <button class="btn" onclick="UI.handleHash('SHA-1')">SHA-1</button>
      <button class="btn" onclick="UI.handleHash('SHA-256')">SHA-256</button>
      <button class="btn" onclick="UI.handleHash('SHA-384')">SHA-384</button>
      <button class="btn" onclick="UI.handleHash('SHA-512')">SHA-512</button>
    </div>
    <div class="output" id="hash-output" style="word-break: break-all; font-family: monospace;"></div>
  `,
  css: () => `
    <div class="input-group">
      <label>X, Y, Blur, Spread (立體陰影產生器)</label>
      <div style="display:flex; gap:8px;">
        <input type="number" id="css-x" value="0" placeholder="X" />
        <input type="number" id="css-y" value="10" placeholder="Y" />
        <input type="number" id="css-b" value="20" placeholder="Blur" />
        <input type="number" id="css-s" value="0" placeholder="Spread" />
      </div>
    </div>
    <button class="btn" onclick="UI.handleCSS()">即時產生</button>
    <div class="output" id="css-output" style="font-family: monospace;">box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.5);</div>
    <div id="css-preview" style="margin-top:20px; width:100%; height:80px; background:var(--card-bg); border-radius:8px; box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.5);"></div>
  `,
  regex: () => `
    <div class="input-group">
      <label>正規表達式 (Regex Pattern) 例如: [a-z]+@[a-z]+\.[a-z]+</label>
      <input id="regex-pattern" placeholder="[a-zA-Z0-9]+@[a-zA-Z0-9]+" />
    </div>
    <div class="input-group">
      <label>測試字串 (Test String)</label>
      <textarea id="regex-str" rows="4" placeholder="hello@world.com"></textarea>
    </div>
    <button class="btn" onclick="UI.handleRegex()">測試匹配</button>
    <div class="output" id="regex-output" style="white-space: pre-wrap;"></div>
  `
};

const UI = {
  handleQR() {
    const text = document.getElementById('qr-input').value.trim();
    if (!text) return alert('請輸入內容或連結');
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
      alert('無效的 JSON');
    }
  },
  handleBase64() {
    const inp = document.getElementById('base64-input');
    if (!inp.files?.[0]) return alert('請選擇檔案');
    const reader = new FileReader();
    reader.onload = () => {
      const base = reader.result.split(',')[1] || reader.result;
      document.getElementById('base64-output').textContent = base;
      const a = document.getElementById('base64-download');
      a.style.display = 'inline-block';
      a.href = reader.result;
      a.download = inp.files[0].name;
    };
    reader.readAsDataURL(inp.files[0]);
  },
  handleBase64Txt(type) {
    const v = document.getElementById('base64-txt').value;
    const out = document.getElementById('base64-output');
    try {
      if (type === 'enc') out.textContent = btoa(encodeURI(v));
      else out.textContent = decodeURI(atob(v));
    } catch { alert('編解碼失敗'); }
  },
  handleDiff() {
    const a = document.getElementById('diff-a').value.split('\n');
    const b = document.getElementById('diff-b').value.split('\n');
    document.getElementById('diff-output').innerHTML = tools.diff?.compare(a, b) || '未實現';
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
    document.getElementById('text-output').textContent = `總字數 (含空白/符號)：${v.length}\n總字數 (去空白)：${v.replace(/\s/g,'').length}`;
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
  },
  handleHash(algo) {
    const v = document.getElementById('hash-input').value;
    if (!v) return alert('請輸入文字');
    tools.hash.sha(algo, v).then(res => {
      document.getElementById('hash-output').textContent = res;
    });
  },
  handleRegex() {
    try {
      const pat = document.getElementById('regex-pattern').value;
      const str = document.getElementById('regex-str').value;
      if (!pat) return;
      const re = new RegExp(pat, 'g');
      const matches = str.match(re);
      document.getElementById('regex-output').textContent = matches ? `找到 ${matches.length} 個匹配項目：\n\n${matches.join('\n')}` : '無匹配結果';
    } catch(e) { document.getElementById('regex-output').textContent = 'Regex 語法錯誤'; }
  },
  handleCSS() {
    const x = document.getElementById('css-x').value || 0;
    const y = document.getElementById('css-y').value || 0;
    const b = document.getElementById('css-b').value || 0;
    const s = document.getElementById('css-s').value || 0;
    const str = `box-shadow: ${x}px ${y}px ${b}px ${s}px rgba(0,0,0,0.5);`;
    document.getElementById('css-output').textContent = str;
    document.getElementById('css-preview').style.boxShadow = `${x}px ${y}px ${b}px ${s}px rgba(0,0,0,0.5)`;
  },
  navigate(path) {
    if (location.pathname !== path) {
      history.pushState(null, '', path);
      renderRoute();
    }
  }
};

window.UI = UI;

function renderRoute() {
  const path = location.pathname;
  let route = ROUTES[path];
  
  // Try mapping root or /home to home explicitly
  if (path === '/' || path === '/home' || !route) {
      route = 'home';
  }
  const app = document.getElementById('app');

  const meta = metaList[route] || (route === 'home' ? { title: '多功能工具箱', desc: '純客戶端、無需伺服器的實用戰備箱' } : { title: '工具', desc: '' });

  app.innerHTML = `
    <div class="card">
      <h2>${meta.title}</h2>
      <p style="color:var(--muted);margin-top:4px">${meta.desc}</p>
      ${renderFields[route]?.() || '<p>頁面未找到</p>'}
    </div>
  `;

  if (route === 'qr' && typeof QRCode === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    document.head.appendChild(s);
  }
  if (route === 'color') {
    ['color-hex','color-r','color-g','color-b'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', UI.handleColor);
    });
  }
  if (route === 'diff') {
    ['diff-a','diff-b'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', UI.handleDiff);
    });
  }
  if (route === 'css') {
    ['css-x','css-y','css-b','css-s'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', UI.handleCSS);
    });
  }
}

window.addEventListener('popstate', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);