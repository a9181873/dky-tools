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
  '/fx': 'fx',
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
  tz: { icon: '🌍', title: '跨國時區即時算', desc: '常常要跟外國客戶開通話？打開它，透過州別、國家、城市分層選擇，立刻為你換算準確當地時間。' },
  fx: { icon: '💱', title: '即時匯率換算 (FX)', desc: '查詢最新國際匯率！自動加上模擬銀行買賣價差，提供最實用的即時換算參考，不需再開網頁搜尋。' },
  hash: { icon: '🔒', title: '加密雜湊 (Hash)', desc: '將任何明文轉換為不可逆的 SHA-256 / SHA-1 加密字串，不透過伺服器，最高規格保護密碼隱私。' },
  css: { icon: '✨', title: 'CSS 視覺產生', desc: '不再死背語法！拉動滑桿即時在畫面上預覽立體陰影 (Box-Shadow)，滿意後直接點擊複製 CSS 給前端貼上。' },
  regex: { icon: '🔎', title: '正則表達測試', desc: '寫程式檢查 Email 格式最頭痛。輸入表達式，它會在下方文章中即時把配對到的字高亮標示出來。' }
};

window.tzDatabase = [
  { region: '亞洲 (Asia)', country: '台灣 (Taiwan)', city: '台北 (Taipei)', tz: 'Asia/Taipei' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '北京 (Beijing)', tz: 'Asia/Shanghai' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '上海 (Shanghai)', tz: 'Asia/Shanghai' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '廣州 (Guangzhou)', tz: 'Asia/Shanghai' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '重慶 (Chongqing)', tz: 'Asia/Chongqing' },
  { region: '亞洲 (Asia)', country: '香港 (Hong Kong)', city: '香港 (Hong Kong)', tz: 'Asia/Hong_Kong' },
  { region: '亞洲 (Asia)', country: '澳門 (Macau)', city: '澳門 (Macau)', tz: 'Asia/Macau' },
  { region: '亞洲 (Asia)', country: '日本 (Japan)', city: '東京 (Tokyo)', tz: 'Asia/Tokyo' },
  { region: '亞洲 (Asia)', country: '日本 (Japan)', city: '大阪 (Osaka)', tz: 'Asia/Tokyo' },
  { region: '亞洲 (Asia)', country: '韓國 (South Korea)', city: '首爾 (Seoul)', tz: 'Asia/Seoul' },
  { region: '亞洲 (Asia)', country: '新加坡 (Singapore)', city: '新加坡 (Singapore)', tz: 'Asia/Singapore' },
  { region: '亞洲 (Asia)', country: '馬來西亞 (Malaysia)', city: '吉隆坡 (Kuala Lumpur)', tz: 'Asia/Kuala_Lumpur' },
  { region: '亞洲 (Asia)', country: '泰國 (Thailand)', city: '曼谷 (Bangkok)', tz: 'Asia/Bangkok' },
  { region: '亞洲 (Asia)', country: '越南 (Vietnam)', city: '胡志明市 (Ho Chi Minh)', tz: 'Asia/Ho_Chi_Minh' },
  { region: '亞洲 (Asia)', country: '菲律賓 (Philippines)', city: '馬尼拉 (Manila)', tz: 'Asia/Manila' },
  { region: '亞洲 (Asia)', country: '印度尼西亞 (Indonesia)', city: '雅加達 (Jakarta)', tz: 'Asia/Jakarta' },
  { region: '亞洲 (Asia)', country: '印度 (India)', city: '新德里 (New Delhi)', tz: 'Asia/Kolkata' },
  { region: '亞洲 (Asia)', country: '印度 (India)', city: '孟買 (Mumbai)', tz: 'Asia/Kolkata' },
  { region: '亞洲 (Asia)', country: '阿聯酋 (UAE)', city: '杜拜 (Dubai)', tz: 'Asia/Dubai' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '紐約 (New York)', tz: 'America/New_York' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '華盛頓 (Washington DC)', tz: 'America/New_York' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '洛杉磯 (Los Angeles)', tz: 'America/Los_Angeles' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '舊金山 (San Francisco)', tz: 'America/Los_Angeles' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '西雅圖 (Seattle)', tz: 'America/Los_Angeles' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '芝加哥 (Chicago)', tz: 'America/Chicago' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '休士頓 (Houston)', tz: 'America/Chicago' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '達拉斯 (Dallas)', tz: 'America/Chicago' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '邁阿密 (Miami)', tz: 'America/New_York' },
  { region: '美洲 (America)', country: '加拿大 (Canada)', city: '多倫多 (Toronto)', tz: 'America/Toronto' },
  { region: '美洲 (America)', country: '加拿大 (Canada)', city: '溫哥華 (Vancouver)', tz: 'America/Vancouver' },
  { region: '美洲 (America)', country: '加拿大 (Canada)', city: '蒙特婁 (Montreal)', tz: 'America/Toronto' },
  { region: '美洲 (America)', country: '墨西哥 (Mexico)', city: '墨西哥城 (Mexico City)', tz: 'America/Mexico_City' },
  { region: '美洲 (America)', country: '巴西 (Brazil)', city: '聖保羅 (Sao Paulo)', tz: 'America/Sao_Paulo' },
  { region: '美洲 (America)', country: '阿根廷 (Argentina)', city: '布宜諾斯艾利斯 (Buenos Aires)', tz: 'America/Argentina/Buenos_Aires' },
  { region: '歐洲 (Europe)', country: '英國 (UK)', city: '倫敦 (London)', tz: 'Europe/London' },
  { region: '歐洲 (Europe)', country: '法國 (France)', city: '巴黎 (Paris)', tz: 'Europe/Paris' },
  { region: '歐洲 (Europe)', country: '德國 (Germany)', city: '柏林 (Berlin)', tz: 'Europe/Berlin' },
  { region: '歐洲 (Europe)', country: '德國 (Germany)', city: '法蘭克福 (Frankfurt)', tz: 'Europe/Berlin' },
  { region: '歐洲 (Europe)', country: '德國 (Germany)', city: '慕尼黑 (Munich)', tz: 'Europe/Berlin' },
  { region: '歐洲 (Europe)', country: '義大利 (Italy)', city: '羅馬 (Rome)', tz: 'Europe/Rome' },
  { region: '歐洲 (Europe)', country: '義大利 (Italy)', city: '米蘭 (Milan)', tz: 'Europe/Rome' },
  { region: '歐洲 (Europe)', country: '西班牙 (Spain)', city: '馬德里 (Madrid)', tz: 'Europe/Madrid' },
  { region: '歐洲 (Europe)', country: '西班牙 (Spain)', city: '巴塞隆納 (Barcelona)', tz: 'Europe/Madrid' },
  { region: '歐洲 (Europe)', country: '荷蘭 (Netherlands)', city: '阿姆斯特丹 (Amsterdam)', tz: 'Europe/Amsterdam' },
  { region: '歐洲 (Europe)', country: '瑞士 (Switzerland)', city: '蘇黎世 (Zurich)', tz: 'Europe/Zurich' },
  { region: '歐洲 (Europe)', country: '土耳其 (Turkey)', city: '伊斯坦堡 (Istanbul)', tz: 'Europe/Istanbul' },
  { region: '大洋洲 (Pacific)', country: '澳洲 (Australia)', city: '雪梨 (Sydney)', tz: 'Australia/Sydney' },
  { region: '大洋洲 (Pacific)', country: '澳洲 (Australia)', city: '墨爾本 (Melbourne)', tz: 'Australia/Melbourne' },
  { region: '大洋洲 (Pacific)', country: '澳洲 (Australia)', city: '布里斯本 (Brisbane)', tz: 'Australia/Brisbane' },
  { region: '大洋洲 (Pacific)', country: '紐西蘭 (New Zealand)', city: '奧克蘭 (Auckland)', tz: 'Pacific/Auckland' },
  { region: '大洋洲 (Pacific)', country: '紐西蘭 (New Zealand)', city: '威靈頓 (Wellington)', tz: 'Pacific/Auckland' },
  { region: '非洲 (Africa)', country: '埃及 (Egypt)', city: '開羅 (Cairo)', tz: 'Africa/Cairo' },
  { region: '非洲 (Africa)', country: '南非 (South Africa)', city: '約翰尼斯堡 (Johannesburg)', tz: 'Africa/Johannesburg' }
];

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
  tz: () => {
    return `
      <div class="input-group" style="display: flex; gap: 8px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 150px;">
          <label>大洲 (Region)</label>
          <select id="tz-region" class="glass-input" onchange="UI.tzRegionChange()" style="width: 100%; border-radius: 6px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); color: white; padding: 12px; font-size: 1rem; outline: none; margin-bottom: 8px;">
            <option value="">--請選擇--</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label>國家 (Country)</label>
          <select id="tz-country" class="glass-input" onchange="UI.tzCountryChange()" style="width: 100%; border-radius: 6px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); color: white; padding: 12px; font-size: 1rem; outline: none; margin-bottom: 8px;">
            <option value="">--請先選大洲--</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label>城市 (City)</label>
          <select id="tz-city" class="glass-input" onchange="UI.tzCityChange()" style="width: 100%; border-radius: 6px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); color: white; padding: 12px; font-size: 1rem; outline: none; margin-bottom: 8px;">
            <option value="">--請先選國家--</option>
          </select>
        </div>
      </div>
      <div class="output" id="tz-output" style="margin-top: 20px; text-align: center;">
        <div id="tz-clock" style="font-size: 2.5rem; font-weight: 300; font-family: monospace;">--:--:--</div>
        <div id="tz-date" style="color: var(--muted); margin-top: 10px;">請從上方清單選擇城市</div>
        <div id="tz-offset" style="font-size: 0.8rem; color: var(--muted); margin-top: 4px;"></div>
      </div>
    `;
  },
  fx: () => {
    const currencies = ['USD', 'TWD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'SGD', 'NZD', 'KRW'];
    return `
      <div class="input-group" style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:150px">
          <label>兌換數量</label>
          <input id="fx-amt" type="number" value="1000" placeholder="例如: 1000" />
        </div>
        <div style="flex:1;min-width:100px">
          <label>基準貨幣 (Base)</label>
          <select id="fx-base" class="glass-input" style="width:100%;border-radius:6px;border:1px solid var(--glass-border);background:rgba(0,0,0,0.3);color:white;padding:12px;font-size:1rem;outline:none;margin-bottom:8px;">
            ${currencies.map(c => `<option value="${c}" ${c === 'USD' ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1;min-width:100px">
          <label>目標貨幣 (Target)</label>
          <select id="fx-target" class="glass-input" style="width:100%;border-radius:6px;border:1px solid var(--glass-border);background:rgba(0,0,0,0.3);color:white;padding:12px;font-size:1rem;outline:none;margin-bottom:8px;">
            ${currencies.map(c => `<option value="${c}" ${c === 'TWD' ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="btn" onclick="UI.handleFX()">取得最新報價與換算</button>
      <div class="output" id="fx-output" style="margin-top:20px; text-align:center;">
         <div style="color:var(--muted); font-size:0.9rem; margin-bottom:8px;">報價來自全球開源匯率 API (中價基準)，並模擬各大銀行 ±0.5% 買賣價差提供參考，實際牌價請依各營業網點為準。</div>
         <div id="fx-result" style="font-size:1.1rem; line-height: 1.8;">請點擊獲取報價</div>
      </div>
    `;
  },
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
    // 已由 updateTZDisplay 接手
  },
  tzInit() {
    const regions = [...new Set(window.tzDatabase.map(t => t.region))];
    const rSel = document.getElementById('tz-region');
    if(rSel) rSel.innerHTML = '<option value="">--請選擇大洲--</option>' + regions.map(r => `<option value="${r}">${r}</option>`).join('');
  },
  tzRegionChange() {
    const r = document.getElementById('tz-region').value;
    const cSel = document.getElementById('tz-country');
    if (!r) {
      cSel.innerHTML = '<option value="">--請先選大洲--</option>';
      document.getElementById('tz-city').innerHTML = '<option value="">--請先選國家--</option>';
      return;
    }
    const countries = [...new Set(window.tzDatabase.filter(t => t.region === r).map(t => t.country))];
    cSel.innerHTML = '<option value="">--請選擇國家--</option>' + countries.map(c => `<option value="${c}">${c}</option>`).join('');
    document.getElementById('tz-city').innerHTML = '<option value="">--請先選國家--</option>';
  },
  tzCountryChange() {
    const r = document.getElementById('tz-region').value;
    const c = document.getElementById('tz-country').value;
    const citySel = document.getElementById('tz-city');
    if (!c) {
      citySel.innerHTML = '<option value="">--請先選國家--</option>';
      return;
    }
    const cities = window.tzDatabase.filter(t => t.region === r && t.country === c);
    citySel.innerHTML = '<option value="">--請選擇城市--</option>' + cities.map(ci => `<option value="${ci.tz}">${ci.city}</option>`).join('');
  },
  tzCityChange() {
    const sel = document.getElementById('tz-city');
    const tz = sel.value;
    if (tz) {
      const cityText = sel.options[sel.selectedIndex].text;
      UI.selectTZ(tz, cityText);
    }
  },
  selectTZ(tz, displayName = tz) {
    window.selectedTZ = tz;
    this.updateTZDisplay();
  },
  updateTZDisplay() {
    if (!window.selectedTZ) return;
    const now = new Date();
    try {
      const timeStr = new Intl.DateTimeFormat('zh-TW', { timeZone: window.selectedTZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
      const dateStr = new Intl.DateTimeFormat('zh-TW', { timeZone: window.selectedTZ, dateStyle: 'full' }).format(now);
      
      const clockEl = document.getElementById('tz-clock');
      const dateEl = document.getElementById('tz-date');
      const offsetEl = document.getElementById('tz-offset');
      
      if (clockEl) clockEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;
      
      // 計算偏移量 (簡易版)
      const offsetName = new Intl.DateTimeFormat('en-US', { timeZone: window.selectedTZ, timeZoneName: 'short' }).format(now).split(', ')[1];
      if (offsetEl) offsetEl.textContent = `時區標示: ${offsetName || ''}`;
    } catch(e) { console.error(e); }
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
  },
  async handleFX() {
    const amtStr = document.getElementById('fx-amt').value;
    const amt = parseFloat(amtStr);
    const base = document.getElementById('fx-base').value;
    const target = document.getElementById('fx-target').value;
    const resEl = document.getElementById('fx-result');
    
    if (isNaN(amt) || amt <= 0) return alert('請輸入有效的金額數量');
    if (base === target) {
      resEl.innerHTML = `同幣別不需換算: ${amt.toLocaleString()} ${base}`;
      return;
    }

    resEl.innerHTML = `<span style="color:var(--accent);">網頁獲取即時報價中...</span>`;
    
    try {
      let rate = 1;
      const resp = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      if (!resp.ok) {
        throw new Error('API 無法取得該貨幣對的報價支援');
      }
      const data = await resp.json();
      if (!data.rates || !data.rates[target]) throw new Error('找不到目標貨幣的即時匯率');
      rate = data.rates[target];
      
      const midVal = (amt * rate).toFixed(3);
      // Simulate fake bank bid/ask spread (0.5% margin)
      const bidRate = rate * 0.995;
      const askRate = rate * 1.005;
      
      const bidVal = (amt * bidRate).toFixed(3);
      const askVal = (amt * askRate).toFixed(3);

      resEl.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-top: 12px; display: inline-block; text-align: left;">
          <div style="margin-bottom: 8px;"><strong>交易中價 (Mid)</strong> : 1 ${base} = ${rate.toFixed(4)} ${target} <br> 總額: <span style="font-size: 1.2rem; color: #aaa;">${midVal}</span></div>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
          <div style="color: #4CAF50; margin-bottom: 8px;">🛒 <strong>銀行賣出參考 (含加減碼)</strong> : 1 ${base} = ${askRate.toFixed(4)} ${target} <br> 找銀行買 ${base} 總成本估算: <span style="font-size: 1.2em; font-weight: bold;">${askVal}</span></div>
          <div style="color: #FF5252;">💵 <strong>銀行買入參考 (含加減碼)</strong> : 1 ${base} = ${bidRate.toFixed(4)} ${target} <br> 賣 ${base} 給銀行總收益估算: <span style="font-size: 1.2em; font-weight: bold;">${bidVal}</span></div>
        </div>
      `;
    } catch (e) {
      resEl.innerHTML = `<span style="color:#FF5252">無法獲取匯率，請稍後再試。錯誤: ${e.message}</span>
      <div style="font-size:0.8rem;color:var(--muted);margin-top:8px;">(備註: 開源 API (Frankfurter) 無法跨行包含部分封閉國家的貨幣，例如新台幣 TWD 支援可能受限)</div>`;
    }
  }
};

let tzTimer = null;

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
  if (route === 'tz') {
    UI.tzInit();
    if (tzTimer) clearInterval(tzTimer);
    tzTimer = setInterval(() => UI.updateTZDisplay(), 1000);
    
    // 不自動選擇，讓使用者自選，保留空白狀態，避免跳掉
    document.getElementById('tz-date').textContent = '請從上方下拉選單篩選並選擇城市';
  } else {
    if (tzTimer) {
      clearInterval(tzTimer);
      tzTimer = null;
    }
  }
}

window.addEventListener('popstate', renderRoute);
window.addEventListener('DOMContentLoaded', () => {
  // 自動將帶有 #/ 的舊版網址轉為新版路徑
  if (location.hash.startsWith('#/')) {
    const cleanPath = location.hash.replace('#', '');
    history.replaceState(null, '', cleanPath);
  }
  renderRoute();
});