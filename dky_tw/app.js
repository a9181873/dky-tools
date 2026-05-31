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
  '/regex': 'regex',
  '/id': 'id',
  '/unit': 'unit',
  '/imgzip': 'imgzip',
  '/videozip': 'videozip',
  '/video2gif': 'video2gif',
  '/pdf': 'pdf'
};

const metaList = {
  qr: { icon: '📱', title: 'QR Code 產生', desc: '輸入任意網址或文字，立刻生成無廣告、可直接下載列印的高解析度 QR Code，適合店家或行銷使用。' },
  json: { icon: '{}', title: 'JSON 格式整理', desc: '當拿到一大串擠在一起的 {} 程式亂碼時，點擊就能瞬間幫你排版成有縮排、有顏色的完美格式，還能揪出哪裡少打引號！' },
  color: { icon: '🎨', title: '色彩代碼轉換', desc: '設計師專用！如果你拿到色號 #00F2FF 卻不知道 RGB 是多少，貼上即可算出所有的色彩代碼 (HEX/RGB/HSL)。' },
  base64: { icon: '📦', title: 'Base64 加解密', desc: '可以把任何文字，或者直接將「圖片檔案」拖曳進來，編碼成亂碼文字方便藏在網頁碼裡，也能隨時無損還原。' },
  diff: { icon: '⚖️', title: '文字 / PDF 比對', desc: '貼上文字或上傳兩份 PDF，自動抽取內容並逐行比對差異。新增刪除一目瞭然，保險文件、合約比對必備利器！' },
  jwt: { icon: '🔑', title: 'JWT Token 解密', desc: '開發者必備：拿到一串 "eyJ" 開頭的登入亂碼通行證時，貼上來即可解析出裡面藏的過期時間或 ID，純本地運算超安全。' },
  pwd: { icon: '🛡️', title: '安全密碼產生', desc: '需要超複雜密碼？這個工具啟用你電腦 CPU 最底層的硬體亂數引擎，生成駭客也猜不到的高強度隨機密碼！' },
  url: { icon: '🔗', title: '網址亂碼還原', desc: '複製中文網址常變成 "%E6%B8%AC" 這種超長亂碼，透過「解碼」就能還原成看得懂的中文；當然也能反向「編碼」。' },
  text: { icon: '📝', title: '文字排版助手', desc: '報告寫了多少字？瞬間幫你結算含空白、去空白的字數；還能一鍵將英文全部轉大寫，或刪除多餘空白。' },
  tz: { icon: '🌍', title: '跨國時區即時算', desc: '常常要跟外國客戶開通話？打開它，透過州別、國家、城市分層選擇，立刻為你換算準確當地時間。' },
  fx: { icon: '💱', title: '即時匯率換算 (FX)', desc: '查詢最新國際匯率！自動加上模擬銀行買賣價差，提供最實用的即時換算參考，不需再開網頁搜尋。' },
  hash: { icon: '🔒', title: '加密雜湊 (Hash)', desc: '將任何明文轉換為不可逆的 SHA-256 / SHA-1 加密字串，不透過伺服器，最高規格保護密碼隱私。' },
  css: { icon: '✨', title: 'CSS 視覺產生', desc: '不再死背語法！拉動滑桿即時在畫面上預覽立體陰影 (Box-Shadow)，滿意後直接點擊複製 CSS 給前端貼上。' },
  regex: { icon: '🔎', title: '正則表達測試', desc: '寫程式檢查 Email 格式最頭痛。輸入表達式，它會在下方文章中即時把配對到的字高亮標示出來。' },
  id: { icon: '🪪', title: 'TW 身份證產生', desc: '開發測試專用：自動計算校驗碼產生符合內政部數學邏輯的身分證字號，或驗證現有字號是否合法。' },
  unit: { icon: '📐', title: '單位換算器', desc: '長度、重量、溫度、面積、速度等 5 大類即時換算！從公里換英里、攝氏換華氏，完全不需要 Google。' },
  imgzip: { icon: '🖼️', title: '圖片批次壓縮', desc: '一次拖入多張圖片，自由選擇 WebP/JPEG/PNG/AVIF 輸出格式，即時預覽壓縮前後對比。所有運算本地完成，不上傳任何資料！' },
  videozip: { icon: '🎬', title: '影片壓縮', desc: '純瀏覽器端壓縮，GPU 硬體加速。提供 Discord/WhatsApp/郵件等常用輸出大小，自訂目標。100% 本機處理，無隱私風險！' },
  video2gif: { icon: '🎞️', title: '影片轉 GIF', desc: '擷取影片片段轉成 GIF 動圖。自訂幀率、畫質、起迄秒數，適合 Discord/Telegram 貼圖。純本機處理，零上傳。' },
  pdf: { icon: '📄', title: 'PDF 工具箱', desc: '檢視 + 文字選取 / 拆頁合併重排旋轉 / 轉成圖片 zip。完全在瀏覽器內處理，零上傳。' }
};

window.tzDatabase = [
  { region: '亞洲 (Asia)', country: '台灣 (Taiwan)', city: '台北 (Taipei)', tz: 'Asia/Taipei' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '北京 (Beijing)', tz: 'Asia/Shanghai' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '上海 (Shanghai)', tz: 'Asia/Shanghai' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '廣州 (Guangzhou)', tz: 'Asia/Shanghai' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '深圳 (Shenzhen)', tz: 'Asia/Shanghai' },
  { region: '亞洲 (Asia)', country: '中國 (China)', city: '重慶 (Chongqing)', tz: 'Asia/Chongqing' },
  { region: '亞洲 (Asia)', country: '香港 (Hong Kong)', city: '香港 (Hong Kong)', tz: 'Asia/Hong_Kong' },
  { region: '亞洲 (Asia)', country: '澳門 (Macau)', city: '澳門 (Macau)', tz: 'Asia/Macau' },
  { region: '亞洲 (Asia)', country: '日本 (Japan)', city: '東京 (Tokyo)', tz: 'Asia/Tokyo' },
  { region: '亞洲 (Asia)', country: '日本 (Japan)', city: '大阪 (Osaka)', tz: 'Asia/Tokyo' },
  { region: '亞洲 (Asia)', country: '韓國 (South Korea)', city: '首爾 (Seoul)', tz: 'Asia/Seoul' },
  { region: '亞洲 (Asia)', country: '韓國 (South Korea)', city: '釜山 (Busan)', tz: 'Asia/Seoul' },
  { region: '亞洲 (Asia)', country: '新加坡 (Singapore)', city: '新加坡 (Singapore)', tz: 'Asia/Singapore' },
  { region: '亞洲 (Asia)', country: '馬來西亞 (Malaysia)', city: '吉隆坡 (Kuala Lumpur)', tz: 'Asia/Kuala_Lumpur' },
  { region: '亞洲 (Asia)', country: '泰國 (Thailand)', city: '曼谷 (Bangkok)', tz: 'Asia/Bangkok' },
  { region: '亞洲 (Asia)', country: '越南 (Vietnam)', city: '胡志明市 (Ho Chi Minh)', tz: 'Asia/Ho_Chi_Minh' },
  { region: '亞洲 (Asia)', country: '越南 (Vietnam)', city: '河內 (Hanoi)', tz: 'Asia/Bangkok' },
  { region: '亞洲 (Asia)', country: '菲律賓 (Philippines)', city: '馬尼拉 (Manila)', tz: 'Asia/Manila' },
  { region: '亞洲 (Asia)', country: '印度尼西亞 (Indonesia)', city: '雅加達 (Jakarta)', tz: 'Asia/Jakarta' },
  { region: '亞洲 (Asia)', country: '印度 (India)', city: '新德里 (New Delhi)', tz: 'Asia/Kolkata' },
  { region: '亞洲 (Asia)', country: '印度 (India)', city: '孟買 (Mumbai)', tz: 'Asia/Kolkata' },
  { region: '亞洲 (Asia)', country: '阿聯酋 (UAE)', city: '杜拜 (Dubai)', tz: 'Asia/Dubai' },
  { region: '亞洲 (Asia)', country: '阿聯酋 (UAE)', city: '阿布達比 (Abu Dhabi)', tz: 'Asia/Dubai' },
  { region: '亞洲 (Asia)', country: '沙烏地阿拉伯 (Saudi Arabia)', city: '利雅德 (Riyadh)', tz: 'Asia/Riyadh' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '紐約 (New York)', tz: 'America/New_York' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '華盛頓 (Washington DC)', tz: 'America/New_York' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '波士頓 (Boston)', tz: 'America/New_York' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '洛杉磯 (Los Angeles)', tz: 'America/Los_Angeles' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '舊金山 (San Francisco)', tz: 'America/Los_Angeles' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '西雅圖 (Seattle)', tz: 'America/Los_Angeles' },
  { region: '美洲 (America)', country: '美國 (USA)', city: '拉斯維加斯 (Las Vegas)', tz: 'America/Los_Angeles' },
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
  { region: '歐洲 (Europe)', country: '英國 (UK)', city: '曼徹斯特 (Manchester)', tz: 'Europe/London' },
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
  { region: '歐洲 (Europe)', country: '瑞士 (Switzerland)', city: '日內瓦 (Geneva)', tz: 'Europe/Zurich' },
  { region: '歐洲 (Europe)', country: '瑞典 (Sweden)', city: '斯德哥爾摩 (Stockholm)', tz: 'Europe/Stockholm' },
  { region: '歐洲 (Europe)', country: '挪威 (Norway)', city: '奧斯陸 (Oslo)', tz: 'Europe/Oslo' },
  { region: '歐洲 (Europe)', country: '丹麥 (Denmark)', city: '哥本哈根 (Copenhagen)', tz: 'Europe/Copenhagen' },
  { region: '歐洲 (Europe)', country: '土耳其 (Turkey)', city: '伊斯坦堡 (Istanbul)', tz: 'Europe/Istanbul' },
  { region: '大洋洲 (Pacific)', country: '澳洲 (Australia)', city: '雪梨 (Sydney)', tz: 'Australia/Sydney' },
  { region: '大洋洲 (Pacific)', country: '澳洲 (Australia)', city: '墨爾本 (Melbourne)', tz: 'Australia/Melbourne' },
  { region: '大洋洲 (Pacific)', country: '澳洲 (Australia)', city: '布里斯本 (Brisbane)', tz: 'Australia/Brisbane' },
  { region: '大洋洲 (Pacific)', country: '澳洲 (Australia)', city: '伯斯 (Perth)', tz: 'Australia/Perth' },
  { region: '大洋洲 (Pacific)', country: '紐西蘭 (New Zealand)', city: '奧克蘭 (Auckland)', tz: 'Pacific/Auckland' },
  { region: '大洋洲 (Pacific)', country: '紐西蘭 (New Zealand)', city: '威靈頓 (Wellington)', tz: 'Pacific/Auckland' },
  { region: '非洲 (Africa)', country: '埃及 (Egypt)', city: '開羅 (Cairo)', tz: 'Africa/Cairo' },
  { region: '非洲 (Africa)', country: '南非 (South Africa)', city: '約翰尼斯堡 (Johannesburg)', tz: 'Africa/Johannesburg' },
  { region: '非洲 (Africa)', country: '南非 (South Africa)', city: '開普敦 (Cape Town)', tz: 'Africa/Johannesburg' },
  { region: '非洲 (Africa)', country: '肯亞 (Kenya)', city: '奈洛比 (Nairobi)', tz: 'Africa/Nairobi' },
  { region: '非洲 (Africa)', country: '奈及利亞 (Nigeria)', city: '拉哥斯 (Lagos)', tz: 'Africa/Lagos' }
];

window.tzDatabase = tools.timezones?.getTimeZoneOptions?.() || window.tzDatabase;

const COMMON_CURRENCIES = [
  'USD','TWD','JPY','EUR','GBP','CNY','HKD','SGD','KRW','AUD','CAD','CHF','THB','MYR','PHP','IDR','INR','VND','NZD','SEK','NOK','DKK',
  'AED','AFN','ALL','AMD','ANG','AOA','ARS','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP',
  'BYN','BZD','CDF','CLP','COP','CRC','CUP','CVE','CZK','DJF','DOP','DZD','EGP','ERN','ETB','FJD','FKP','GEL','GHS','GIP','GMD','GNF',
  'GTQ','GYD','HNL','HRK','HTG','HUF','ILS','IQD','IRR','ISK','JMD','JOD','KES','KGS','KHR','KID','KMF','KWD','KYD','KZT','LAK','LBP',
  'LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MZN','NAD','NGN','NIO','NPR','OMR',
  'PAB','PEN','PGK','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SHP','SLE','SOS','SRD','SSP','STN','SYP',
  'SZL','TJS','TMT','TND','TOP','TRY','TTD','TVD','TZS','UAH','UGX','UYU','UZS','VES','VUV','WST','XAF','XCD','XOF','XPF','YER','ZAR','ZMW','ZWL'
];

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function currencyOptionsHTML(selected = 'USD') {
  const display = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['zh-TW', 'en'], { type: 'currency' })
    : null;
  const browserCodes = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('currency')
    : [];
  const codes = [...new Set([...COMMON_CURRENCIES, ...browserCodes])].sort();
  const priority = ['USD','TWD','JPY','EUR','GBP','CNY','HKD','SGD','KRW','AUD','CAD','CHF'];
  const ordered = [...priority, ...codes.filter(code => !priority.includes(code))];
  return ordered.map(code => {
    let name = code;
    try { name = display?.of(code) || code; } catch { name = code; }
    return `<option value="${code}" ${code === selected ? 'selected' : ''}>${code} — ${escapeHTML(name)}</option>`;
  }).join('');
}

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
    <div class="diff-tabs">
      <button class="diff-tab active" onclick="UI.switchDiffMode('text')">📝 文字比對</button>
      <button class="diff-tab" onclick="UI.switchDiffMode('pdf')">📄 PDF 比對</button>
    </div>
    <div id="diff-mode-text">
      <div class="input-group">
        <label>原文 A</label>
        <textarea id="diff-a" rows="4" placeholder="第一行&#10;第二行"></textarea>
      </div>
      <div class="input-group">
        <label>比較 B</label>
        <textarea id="diff-b" rows="4" placeholder="第一行&#10;改為第二行"></textarea>
      </div>
    </div>
    <div id="diff-mode-pdf" style="display:none;">
      <div class="diff-pdf-row">
        <div class="diff-pdf-col">
          <label>PDF 檔案 A</label>
          <div class="diff-pdf-drop" id="diff-pdf-drop-a">
            <input type="file" id="diff-pdf-a" accept=".pdf,application/pdf" onchange="UI.handlePdfSelect('a')" />
            <span class="diff-pdf-placeholder">📁 點擊或拖曳 PDF</span>
            <span class="diff-pdf-loaded" id="diff-pdf-name-a"></span>
          </div>
        </div>
        <div class="diff-pdf-col">
          <label>PDF 檔案 B</label>
          <div class="diff-pdf-drop" id="diff-pdf-drop-b">
            <input type="file" id="diff-pdf-b" accept=".pdf,application/pdf" onchange="UI.handlePdfSelect('b')" />
            <span class="diff-pdf-placeholder">📁 點擊或拖曳 PDF</span>
            <span class="diff-pdf-loaded" id="diff-pdf-name-b"></span>
          </div>
        </div>
      </div>
      <div style="color:var(--muted);font-size:0.8rem;margin-top:4px;">⚠️ PDF 文字抽取在瀏覽器端完成，大檔案（50 頁以上）可能需要數秒。</div>
    </div>
    <div class="input-group" style="margin-top:12px;">
      <label>比對模式</label>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-sm diff-mode-btn active" data-mode="lines" onclick="UI.setDiffMode('lines', this)">逐行比對</button>
        <button class="btn btn-sm diff-mode-btn" data-mode="words" onclick="UI.setDiffMode('words', this)">逐字比對</button>
      </div>
    </div>
    <button class="btn" onclick="UI.handleDiff()">開始比對</button>
    <div class="output" id="diff-output" style="font-family: monospace; white-space: pre-wrap; min-height:100px; max-height:500px; overflow-y:auto;"></div>
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
      <div class="input-group">
        <label>洲別 / 區域</label>
        <select id="tz-region" onchange="UI.handleTZRegionChange()"></select>
      </div>
      <div class="input-group">
        <label>國家</label>
        <select id="tz-country" onchange="UI.handleTZCountryChange()"></select>
      </div>
      <div class="input-group">
        <label>城市快速搜尋 (中英文皆可)</label>
        <input id="tz-search" class="glass-input" placeholder="例如：台北、Tokyo、Los Angeles、Osaka" oninput="UI.filterTZ()" />
      </div>
      <div class="input-group">
        <label>城市</label>
        <select id="tz-city" size="8" onchange="UI.selectTZFromDropdown()" style="min-height:220px;"></select>
        <div id="tz-count" style="color:var(--muted);font-size:0.85rem;margin-top:8px;"></div>
      </div>
      <div class="output" id="tz-output" style="margin-top: 20px; text-align: center;">
        <div id="tz-clock" style="font-size: 2.5rem; font-weight: 300; font-family: monospace;">--:--:--</div>
        <div id="tz-date" style="color: var(--muted); margin-top: 10px;">請選擇洲別、國家與城市</div>
        <div id="tz-offset" style="font-size: 0.8rem; color: var(--muted); margin-top: 4px;"></div>
      </div>
    `;
  },
  fx: () => {
    return `
      <div class="input-group" style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:150px">
          <label>兌換數量</label>
          <input id="fx-amt" type="number" value="1000" placeholder="例如: 1000" />
        </div>
        <div style="flex:1;min-width:100px">
          <label>基準貨幣 (Base)</label>
          <select id="fx-base" onchange="UI.handleFX()">${currencyOptionsHTML('USD')}</select>
        </div>
        <div style="display:flex;align-items:end;">
          <button class="btn" onclick="UI.handleFXSwap()" title="交換幣別" style="margin-right:0;">交換</button>
        </div>
        <div style="flex:1;min-width:100px">
          <label>目標貨幣 (Target)</label>
          <select id="fx-target" onchange="UI.handleFX()">${currencyOptionsHTML('TWD')}</select>
        </div>
      </div>
      <div class="output" id="fx-output" style="margin-top:20px; text-align:center;">
         <div style="color:var(--muted); font-size:0.9rem; margin-bottom:8px;">報價來自全球開源匯率 API (中價基準)</div>
         <div id="fx-result" style="font-size:1.5rem; line-height: 1.8;">載入中...</div>
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
  `,
  id: () => {
    const cities = tools.id?.getCities?.() || [];
    const cityOptions = cities.map(c => `<option value="${c.letter}">${c.label}</option>`).join('');
    return `
    <div style="background: rgba(255, 193, 7, 0.1); color: #FFC107; padding: 10px; border-radius: 6px; margin-bottom: 20px; font-size: 0.9rem;">
      <strong>⚠️ 警語</strong>: 本工具純粹依據官方數學邏輯隨機演算生成。產生的字號僅供「程式開發」與「系統測試」使用，有機率與真實字號巧合相同，切勿用於任何真實網站註冊或非法用途！
    </div>
    <div style="display:flex; gap: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; padding: 15px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(0,0,0,0.2);">
            <h3 style="margin-top:0;">✨ 產生器</h3>
            <div class="input-group">
                <label>縣市 / 區域</label>
                <select id="id-city" style="width:100%;border-radius:6px;border:1px solid var(--glass-border);background:rgba(0,0,0,0.3);color:white;padding:12px;font-size:1rem;outline:none;margin-bottom:8px;">
                    <option value="">隨機</option>
                    ${cityOptions}
                </select>
            </div>
            <div class="input-group">
                <label>性別</label>
                <select id="id-gender" style="width:100%;border-radius:6px;border:1px solid var(--glass-border);background:rgba(0,0,0,0.3);color:white;padding:12px;font-size:1rem;outline:none;margin-bottom:8px;">
                    <option value="">隨機</option>
                    <option value="1">1 — 男性 (本國籍)</option>
                    <option value="2">2 — 女性 (本國籍)</option>
                    <option value="8">8 — 男性 (外國籍)</option>
                    <option value="9">9 — 女性 (外國籍)</option>
                </select>
            </div>
            <div class="input-group">
                <label>自訂流水號 (7 碼數字，留空則隨機)</label>
                <input id="id-serial" placeholder="例如: 2345678" maxlength="7" style="letter-spacing:2px;" />
            </div>
            <div class="input-group">
                <label>批量產生數量</label>
                <select id="id-batch" style="width:100%;border-radius:6px;border:1px solid var(--glass-border);background:rgba(0,0,0,0.3);color:white;padding:12px;font-size:1rem;outline:none;margin-bottom:8px;">
                    <option value="1" selected>1 組</option>
                    <option value="5">5 組</option>
                    <option value="10">10 組</option>
                    <option value="20">20 組</option>
                    <option value="50">50 組</option>
                </select>
            </div>
            <button class="btn" onclick="UI.handleIdGen()">產生字號</button>
            <div class="output" id="id-gen-output" style="font-size: 1.1rem; text-align: center; letter-spacing: 3px; margin-top: 10px; font-family: monospace; line-height: 2;">點擊產生</div>
        </div>
        
        <div style="flex: 1; min-width: 280px; padding: 15px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(0,0,0,0.2);">
            <h3 style="margin-top:0;">🛡️ 真偽驗證器</h3>
            <div class="input-group">
                <label>輸入身分證字號</label>
                <input id="id-val-input" placeholder="例如: A123456789" maxlength="10" style="letter-spacing:3px; font-size:1.2rem;" />
            </div>
            <button class="btn" onclick="UI.handleIdVal()">驗證</button>
            <div class="output" id="id-val-output" style="margin-top: 10px; line-height: 1.8;">等待驗證</div>
        </div>
    </div>
  `;
  },
  unit: () => {
    const cats = tools.unit?.getCategories?.() || [];
    const defaultCat = cats[0] || { key: '', units: [] };
    const unitOptions = (units) => units.map(u => `<option value="${u.key}">${u.label}</option>`).join('');
    return `
      <div class="input-group">
        <label>換算類別</label>
        <select id="unit-cat" onchange="UI.handleUnitCatChange()" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:12px;font-size:1rem;outline:none;margin-bottom:8px;">
          ${cats.map(c => `<option value="${c.key}">${c.name}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;">
          <div class="input-group" style="margin-bottom:0">
            <label>數值</label>
            <input id="unit-val" type="number" value="1" oninput="UI.handleUnitConvert()" />
          </div>
        </div>
        <div style="flex:1;min-width:130px;">
          <div class="input-group" style="margin-bottom:0">
            <label>從</label>
            <select id="unit-from" onchange="UI.handleUnitConvert()" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:12px;font-size:1rem;outline:none;">
              ${unitOptions(defaultCat.units)}
            </select>
          </div>
        </div>
        <div style="font-size:1.5rem;padding-top:20px;color:var(--accent)">→</div>
        <div style="flex:1;min-width:130px;">
          <div class="input-group" style="margin-bottom:0">
            <label>到</label>
            <select id="unit-to" onchange="UI.handleUnitConvert()" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:12px;font-size:1rem;outline:none;">
              ${unitOptions(defaultCat.units)}
            </select>
          </div>
        </div>
      </div>
      <div class="output" id="unit-output" style="font-size:1.8rem;text-align:center;margin-top:24px;letter-spacing:2px;">請選擇類別與單位</div>
    `;
  },
  imgzip: () => `
    <div style="background: rgba(0, 242, 255, 0.05); border: 1px solid rgba(0,242,255,0.2); color: var(--accent); padding: 10px 14px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem;">
      ⚠️ <strong>支援</strong>：JPG / PNG / WEBP，可輸出為 WebP / JPEG / PNG / AVIF（AVIF 需瀏覽器支援）。所有壓縮在瀏覽器本地完成。
    </div>
    <div class="input-group">
      <label>選擇圖片（可多選或拖曳）</label>
      <div class="imgzip-dropzone" id="imgzip-dropzone">
        <input id="imgzip-file" type="file" accept="image/jpeg,image/png,image/webp" multiple onchange="UI.handleImgZipFiles()" />
        <span class="imgzip-drop-text">📁 點擊選取或拖曳多張圖片到這裡</span>
      </div>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:end;margin-bottom:16px;">
      <div class="input-group" style="flex:0 1 auto;min-width:160px;margin-bottom:0;">
        <label>輸出格式</label>
        <select id="imgzip-format" onchange="UI.handleImgZipRecompress()" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:12px;font-size:1rem;outline:none;">
          <option value="webp" selected>WebP（體積最小，推薦）</option>
          <option value="jpeg">JPEG（最通用）</option>
          <option value="png">PNG（支援透明）</option>
          <option value="avif">AVIF（最新格式）</option>
        </select>
      </div>
      <div class="input-group" style="flex:1;min-width:200px;margin-bottom:0;">
        <label>壓縮品質 (<span id="imgzip-quality-label">80</span>%)</label>
        <input id="imgzip-quality" type="range" min="10" max="100" value="80" oninput="document.getElementById('imgzip-quality-label').textContent=this.value; UI.handleImgZipRecompress()" style="width:100%;accent-color:var(--accent);" />
      </div>
    </div>
    <div id="imgzip-total-stats" style="display:none;margin-bottom:16px;padding:12px;background:rgba(76,175,80,0.08);border:1px solid rgba(76,175,80,0.2);border-radius:8px;text-align:center;">
      <span style="color:var(--muted);">總計 </span>
      <strong id="imgzip-total-count">0</strong><span style="color:var(--muted);"> 張圖片，共節省 </span>
      <strong style="color:#81c784;" id="imgzip-total-saved">0 KB</strong><span style="color:var(--muted);">（</span><strong style="color:#81c784;" id="imgzip-total-percent">0%</strong><span style="color:var(--muted);">）</span>
    </div>
    <div id="imgzip-list" style="display:flex;flex-direction:column;gap:16px;"></div>
    <div id="imgzip-actions" style="display:none;margin-top:16px;text-align:center;">
      <button class="btn" onclick="UI.handleImgZipDownloadAll()">⬇️ 批次下載全部</button>
    </div>
  `,
  videozip: () => `
    <div class="input-group" style="margin-bottom:10px;">
      <div class="imgzip-dropzone" id="videozip-dropzone" style="padding:24px;">
        <input id="videozip-file" type="file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/*" onchange="UI.handleVideoZipFile()" />
        <span id="videozip-drop-text" class="imgzip-drop-text">🎬 點擊選取或拖曳影片到這裡（MP4/WebM/MOV/MKV/AVI · 最大 2GB）</span>
      </div>
    </div>

    <div id="videozip-info" style="display:none;padding:12px;background:rgba(255,255,255,0.03);border:1px solid var(--border-light);border-radius:8px;margin-bottom:12px;">
      <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.85rem;color:var(--muted);">
        <span id="videozip-info-name"></span>
        <span id="videozip-info-size"></span>
        <span id="videozip-info-dims"></span>
        <span id="videozip-info-dur"></span>
      </div>
    </div>

    <div id="videozip-controls" style="display:none;">
      <div class="input-group" style="margin-bottom:12px;">
        <label>輸出大小</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;" id="videozip-presets"></div>
      </div>
      <div class="input-group" id="videozip-custom-group" style="display:none;margin-bottom:12px;">
        <label>自訂目標大小 (MB)</label>
        <input id="videozip-custom-mb" type="number" min="1" max="2000" value="50" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:10px;font-size:0.9rem;outline:none;" />
      </div>
      <button class="btn" id="videozip-start-btn" onclick="UI.handleVideoZipCompress()" style="width:100%;font-size:1.1rem;">🚀 開始壓縮</button>
    </div>

    <div id="videozip-progress" style="display:none;margin-top:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:0.85rem;" id="videozip-status-text">處理中...</span>
        <span style="font-size:0.85rem;color:var(--accent);" id="videozip-progress-pct">0%</span>
      </div>
      <div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">
        <div id="videozip-progress-bar" style="width:0%;height:100%;background:var(--accent);transition:width 0.3s;border-radius:3px;"></div>
      </div>
    </div>

    <div id="videozip-result" style="display:none;margin-top:16px;padding:16px;background:rgba(76,175,80,0.08);border:1px solid rgba(76,175,80,0.2);border-radius:8px;text-align:center;">
      <div style="font-size:1.1rem;margin-bottom:8px;">✅ 壓縮完成</div>
      <div style="color:var(--muted);font-size:0.85rem;margin-bottom:4px;" id="videozip-result-stats"></div>
      <div style="font-size:0.8rem;color:var(--muted);margin-bottom:12px;" id="videozip-result-mode"></div>
      <a class="btn" id="videozip-dl-link" download style="display:inline-flex;">⬇️ 下載壓縮影片</a>
    </div>
  `,
  video2gif: () => `
    <div class="input-group" style="margin-bottom:10px;">
      <div class="imgzip-dropzone" id="v2g-dropzone" style="padding:24px;">
        <input id="v2g-file" type="file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*" onchange="UI.handleV2GFile()" />
        <span id="v2g-drop-text" class="imgzip-drop-text">🎬 點擊選取或拖曳影片（MP4/WebM/MOV · 建議 ≦100MB）</span>
      </div>
    </div>

    <div id="v2g-info" style="display:none;padding:12px;background:rgba(255,255,255,0.03);border:1px solid var(--border-light);border-radius:8px;margin-bottom:12px;">
      <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.85rem;color:var(--muted);">
        <span id="v2g-info-name"></span>
        <span id="v2g-info-size"></span>
        <span id="v2g-info-dur"></span>
      </div>
    </div>

    <div id="v2g-controls" style="display:none;">
      <div class="input-group" style="margin-bottom:12px;">
        <label>擷取範圍</label>
        <div style="display:flex;gap:8px;align-items:center;">
          <input id="v2g-start" type="number" min="0" step="0.5" value="0" style="width:80px;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:8px;font-size:0.85rem;outline:none;" />
          <span style="color:var(--muted);font-size:0.85rem;">秒 ～</span>
          <input id="v2g-end" type="number" min="0.5" step="0.5" value="3" style="width:80px;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:8px;font-size:0.85rem;outline:none;" />
          <span style="color:var(--muted);font-size:0.85rem;">秒</span>
        </div>
      </div>

      <div class="input-group" style="margin-bottom:12px;">
        <label>輸出設定</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;" id="v2g-presets"></div>
      </div>
      <div class="input-group" id="v2g-custom-group" style="display:none;margin-bottom:12px;">
        <div style="display:flex;gap:8px;">
          <div style="flex:1;">
            <label>最大寬度 (px)</label>
            <input id="v2g-custom-w" type="number" min="100" max="1920" value="480" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:8px;font-size:0.85rem;outline:none;" />
          </div>
          <div style="flex:1;">
            <label>幀率 (fps)</label>
            <input id="v2g-custom-fps" type="number" min="5" max="30" value="15" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:8px;font-size:0.85rem;outline:none;" />
          </div>
        </div>
      </div>
      <button class="btn" id="v2g-start-btn" onclick="UI.handleV2GConvert()" style="width:100%;font-size:1.1rem;">🎞️ 開始轉換</button>
    </div>

    <div id="v2g-progress" style="display:none;margin-top:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:0.85rem;" id="v2g-status-text">擷取畫面中...</span>
        <span style="font-size:0.85rem;color:var(--accent);" id="v2g-progress-pct">0%</span>
      </div>
      <div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">
        <div id="v2g-progress-bar" style="width:0%;height:100%;background:var(--accent);transition:width 0.3s;border-radius:3px;"></div>
      </div>
    </div>

    <div id="v2g-result" style="display:none;margin-top:16px;padding:16px;background:rgba(76,175,80,0.08);border:1px solid rgba(76,175,80,0.2);border-radius:8px;text-align:center;">
      <div style="font-size:1.1rem;margin-bottom:8px;">✅ 轉換完成</div>
      <div style="margin-bottom:12px;">
        <img id="v2g-preview" style="max-width:100%;border-radius:8px;" />
      </div>
      <div style="color:var(--muted);font-size:0.85rem;margin-bottom:4px;" id="v2g-result-stats"></div>
      <a class="btn" id="v2g-dl-link" download style="display:inline-flex;margin-top:8px;">⬇️ 下載 GIF</a>
    </div>
  `,
  pdf: () => `
    <div class="pdf-tabs">
      <button class="pdf-tab pdf-tab-active" data-tab="view" onclick="UI.switchPdfTab('view')">📖 檢視</button>
      <button class="pdf-tab" data-tab="edit" onclick="UI.switchPdfTab('edit')">✂️ 編輯頁面</button>
      <button class="pdf-tab" data-tab="export" onclick="UI.switchPdfTab('export')">🖼️ 轉圖片</button>
    </div>

    <!-- ===== Tab 1: 檢視 ===== -->
    <div class="pdf-tab-panel" id="pdf-tab-view">
      <div class="input-group" style="margin-bottom:10px;">
        <div class="imgzip-dropzone" id="pdf-dropzone" style="padding:18px;">
          <input id="pdf-file" type="file" accept=".pdf,application/pdf" onchange="UI.handlePdfFileChange()" />
          <span id="pdf-drop-text" class="imgzip-drop-text" style="font-size:0.9rem;">📁 點擊或拖曳 PDF（完全在瀏覽器內處理，不會上傳）</span>
        </div>
      </div>
      <div id="pdf-toolbar" class="pdf-toolbar" style="display:none;">
        <div class="pdf-toolbar-group">
          <button class="btn pdf-tb-btn" id="pdf-prev" onclick="UI.handlePdfPage(-1)" title="上一頁">‹</button>
          <span class="pdf-page-indicator">
            <input type="number" id="pdf-page-input" min="1" value="1" onchange="UI.handlePdfJump()" />
            <span>/ <span id="pdf-page-total">0</span></span>
          </span>
          <button class="btn pdf-tb-btn" id="pdf-next" onclick="UI.handlePdfPage(1)" title="下一頁">›</button>
        </div>
        <div class="pdf-toolbar-group">
          <button class="btn pdf-tb-btn" onclick="UI.handlePdfZoom(-1)" title="縮小">−</button>
          <span class="pdf-zoom-indicator" id="pdf-zoom-label">125%</span>
          <button class="btn pdf-tb-btn" onclick="UI.handlePdfZoom(1)" title="放大">+</button>
          <button class="btn pdf-tb-btn" onclick="UI.handlePdfZoom(0)" title="適合寬度">↔</button>
        </div>
        <div class="pdf-toolbar-group">
          <button class="btn pdf-tb-btn" onclick="UI.handlePdfPrint()" title="列印">🖨</button>
        </div>
      </div>
      <div id="pdf-status" style="display:none; color:var(--muted); margin: 10px 0; font-size:0.9rem;"></div>
      <div id="pdf-viewer" class="pdf-viewer" style="display:none;"></div>
    </div>

    <!-- ===== Tab 2: 編輯頁面 ===== -->
    <div class="pdf-tab-panel" id="pdf-tab-edit" style="display:none;">
      <div class="input-group" style="margin-bottom:10px;">
        <div class="imgzip-dropzone" style="padding:18px;">
          <input id="pdf-edit-file" type="file" accept=".pdf,application/pdf" multiple onchange="UI.handlePdfEditFiles()" />
          <span id="pdf-edit-drop-text" class="imgzip-drop-text" style="font-size:0.9rem;">📁 拖曳一或多個 PDF（會自動合併）</span>
        </div>
      </div>
      <div id="pdf-edit-toolbar" class="pdf-toolbar" style="display:none;">
        <div class="pdf-toolbar-group">
          <span style="color:var(--muted); font-size:0.85rem;">共 <span id="pdf-edit-count">0</span> 頁</span>
          <button class="btn pdf-tb-btn" onclick="UI.handlePdfEditSelectAll(true)" title="全選">☑ 全</button>
          <button class="btn pdf-tb-btn" onclick="UI.handlePdfEditSelectAll(false)" title="全不選">☐ 無</button>
        </div>
        <div class="pdf-toolbar-group">
          <button class="btn" onclick="UI.handlePdfEditSave()">💾 下載編輯後 PDF</button>
          <button class="btn pdf-tb-btn" onclick="UI.handlePdfEditReset()" title="清空">🗑</button>
        </div>
      </div>
      <div id="pdf-edit-status" style="display:none; color:var(--muted); margin: 8px 0; font-size:0.85rem;"></div>
      <div id="pdf-edit-grid" class="pdf-thumb-grid" style="display:none;"></div>
    </div>

    <!-- ===== Tab 3: 轉圖片 ===== -->
    <div class="pdf-tab-panel" id="pdf-tab-export" style="display:none;">
      <div class="input-group" style="margin-bottom:10px;">
        <div class="imgzip-dropzone" style="padding:18px;">
          <input id="pdf-export-file" type="file" accept=".pdf,application/pdf" onchange="UI.handlePdfExportFile()" />
          <span id="pdf-export-drop-text" class="imgzip-drop-text" style="font-size:0.9rem;">📁 拖曳一個 PDF</span>
        </div>
      </div>
      <div id="pdf-export-options" style="display:none;">
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
          <div class="input-group" style="flex:1;min-width:160px;margin-bottom:0;">
            <label>解析度 (DPI)</label>
            <select id="pdf-export-dpi" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:10px;font-size:0.9rem;outline:none;">
              <option value="72">72 — 螢幕用 (小)</option>
              <option value="150" selected>150 — 一般</option>
              <option value="300">300 — 印刷品質 (大)</option>
              <option value="450">450 — 超高清</option>
            </select>
          </div>
          <div class="input-group" style="flex:1;min-width:160px;margin-bottom:0;">
            <label>格式</label>
            <select id="pdf-export-format" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:10px;font-size:0.9rem;outline:none;">
              <option value="image/png" selected>PNG (清晰、檔案大)</option>
              <option value="image/jpeg">JPEG (小、有失真)</option>
              <option value="image/webp">WebP (最小)</option>
            </select>
          </div>
          <div class="input-group" style="flex:2;min-width:200px;margin-bottom:0;">
            <label>頁範圍 (例：1-3,5,7-9，留空 = 全部)</label>
            <input id="pdf-export-range" type="text" placeholder="all" style="width:100%;border-radius:8px;border:1px solid var(--border-light);background:rgba(0,0,0,0.3);color:var(--text-main);padding:10px;font-size:0.9rem;outline:none;" />
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn" onclick="UI.handlePdfExportRun()">📦 開始匯出並打包 zip</button>
        </div>
        <div id="pdf-export-progress" style="display:none; margin-top:12px;">
          <div style="background:rgba(255,255,255,0.08); border-radius:8px; height:8px; overflow:hidden;">
            <div id="pdf-export-bar" style="background:linear-gradient(90deg,var(--accent),#7ee8fa); height:100%; width:0%; transition:width 0.2s;"></div>
          </div>
          <div id="pdf-export-text" style="margin-top:6px; font-size:0.8rem; color:var(--muted); text-align:center;"></div>
        </div>
      </div>
      <div id="pdf-export-status" style="display:none; color:var(--muted); margin: 10px 0; font-size:0.9rem;"></div>
    </div>
  `,
};

const UI = {
  handleQR() {
    const text = document.getElementById('qr-input').value.trim();
    if (!text) return alert('請輸入內容或連結');
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
  diffMode: 'lines',
  diffInputMode: 'text',
  switchDiffMode(mode) {
    this.diffInputMode = mode;
    const textEl = document.getElementById('diff-mode-text');
    const pdfEl = document.getElementById('diff-mode-pdf');
    const tabs = document.querySelectorAll('.diff-tab');
    if (mode === 'text') {
      if (textEl) textEl.style.display = 'block';
      if (pdfEl) pdfEl.style.display = 'none';
      tabs[0]?.classList.add('active');
      tabs[1]?.classList.remove('active');
    } else {
      if (textEl) textEl.style.display = 'none';
      if (pdfEl) pdfEl.style.display = 'block';
      tabs[0]?.classList.remove('active');
      tabs[1]?.classList.add('active');
    }
  },
  setDiffMode(mode, btn) {
    this.diffMode = mode;
    document.querySelectorAll('.diff-mode-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },
  handlePdfSelect(side) {
    const file = document.getElementById(`diff-pdf-${side}`)?.files?.[0];
    const nameEl = document.getElementById(`diff-pdf-name-${side}`);
    const placeholderEl = document.querySelector(`#diff-pdf-drop-${side} .diff-pdf-placeholder`);
    if (file && nameEl) {
      nameEl.textContent = `✅ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      nameEl.style.display = 'block';
      if (placeholderEl) placeholderEl.style.display = 'none';
    }
  },
  async handleDiff() {
    const output = document.getElementById('diff-output');
    output.innerHTML = '<span style="color:var(--muted)">比對中...</span>';

    try {
      let textA, textB;

      if (this.diffInputMode === 'pdf') {
        const fileA = document.getElementById('diff-pdf-a')?.files?.[0];
        const fileB = document.getElementById('diff-pdf-b')?.files?.[0];
        if (!fileA || !fileB) {
          output.innerHTML = '⚠️ 請先選擇兩份 PDF 檔案';
          return;
        }
        output.innerHTML = '<span style="color:var(--muted)">正在抽取 PDF A 文字...</span>';
        textA = await tools.diff.extractPdfText(fileA);
        output.innerHTML = '<span style="color:var(--muted)">正在抽取 PDF B 文字...</span>';
        textB = await tools.diff.extractPdfText(fileB);
        output.innerHTML = '<span style="color:var(--muted)">正在比對差異...</span>';
      } else {
        textA = document.getElementById('diff-a')?.value || '';
        textB = document.getElementById('diff-b')?.value || '';
        if (!textA && !textB) {
          output.innerHTML = '⚠️ 請在兩邊輸入文字';
          return;
        }
      }

      if (this.diffMode === 'lines') {
        output.innerHTML = await tools.diff.compareLines(textA, textB);
      } else {
        output.innerHTML = await tools.diff.compare(textA, textB);
      }
    } catch (e) {
      output.textContent = `比對錯誤: ${e.message}`;
    }
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
  initTZ() {
    const data = window.tzDatabase || [];
    const regionEl = document.getElementById('tz-region');
    if (!regionEl || data.length === 0) return;
    const regions = [...new Set(data.map(item => item.region))].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
    regionEl.innerHTML = `<option value="">全部洲別 / 區域</option>${regions.map(region => `<option value="${escapeHTML(region)}">${escapeHTML(region)}</option>`).join('')}`;
    regionEl.value = regions.includes('亞洲 (Asia)') ? '亞洲 (Asia)' : '';
    this.populateTZCountries();
    this.populateTZCities(true);
  },
  populateTZCountries() {
    const data = window.tzDatabase || [];
    const region = document.getElementById('tz-region')?.value || '';
    const countryEl = document.getElementById('tz-country');
    if (!countryEl) return;
    const countries = [...new Set(data
      .filter(item => !region || item.region === region)
      .map(item => item.country)
    )].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
    countryEl.innerHTML = `<option value="">全部國家</option>${countries.map(country => `<option value="${escapeHTML(country)}">${escapeHTML(country)}</option>`).join('')}`;
    const preferred = region === '亞洲 (Asia)' ? '台灣 (Taiwan)' : '';
    countryEl.value = countries.includes(preferred) ? preferred : '';
  },
  populateTZCities(selectFirst = false) {
    const data = window.tzDatabase || [];
    const region = document.getElementById('tz-region')?.value || '';
    const country = document.getElementById('tz-country')?.value || '';
    const query = (document.getElementById('tz-search')?.value || '').trim().toLowerCase();
    const cityEl = document.getElementById('tz-city');
    const countEl = document.getElementById('tz-count');
    if (!cityEl) return;

    window.tzFiltered = data.filter(item => {
      const haystack = `${item.region} ${item.country} ${item.city} ${item.tz}`.toLowerCase();
      return (!region || item.region === region)
        && (!country || item.country === country)
        && (!query || haystack.includes(query));
    });

    if (window.tzFiltered.length === 0) {
      cityEl.innerHTML = '<option value="">找不到符合的城市，請放寬國家或搜尋字</option>';
      if (countEl) countEl.textContent = '目前沒有符合的城市。';
      return;
    }

    cityEl.innerHTML = window.tzFiltered.map((item, index) => `
      <option value="${index}">${escapeHTML(item.city)} · ${escapeHTML(item.country)} · ${escapeHTML(item.tz)}</option>
    `).join('');
    if (countEl) countEl.textContent = `可選 ${window.tzFiltered.length.toLocaleString()} 個城市 / 時區，資料含常用城市與瀏覽器支援的 IANA 時區。`;
    if (selectFirst || !window.selectedTZ) {
      cityEl.selectedIndex = 0;
      this.selectTZFromDropdown();
    }
  },
  handleTZRegionChange() {
    const searchEl = document.getElementById('tz-search');
    if (searchEl) searchEl.value = '';
    this.populateTZCountries();
    this.populateTZCities(true);
  },
  handleTZCountryChange() {
    const searchEl = document.getElementById('tz-search');
    if (searchEl) searchEl.value = '';
    this.populateTZCities(true);
  },
  filterTZ() {
    this.populateTZCities(true);
  },
  selectTZFromDropdown() {
    const cityEl = document.getElementById('tz-city');
    const item = window.tzFiltered?.[parseInt(cityEl?.value || '0', 10)];
    if (!item) return;
    this.selectTZ(item.tz, `${item.city} · ${item.country}`);
  },
  selectTZ(tz, displayName = tz) {
    window.selectedTZ = tz;
    window.selectedTZName = displayName;
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
      if (dateEl) dateEl.textContent = `${window.selectedTZName || ''} — ${dateStr}`;
      
      // 計算偏移量
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
  handleFXSwap() {
    const baseEl = document.getElementById('fx-base');
    const targetEl = document.getElementById('fx-target');
    if (!baseEl || !targetEl) return;
    const currentBase = baseEl.value;
    baseEl.value = targetEl.value;
    targetEl.value = currentBase;
    this.handleFX();
  },
  getIdeaBoxFormData() {
    const get = id => (document.getElementById(id)?.value || '').trim();
    return {
      company: get('idea-company') || '台灣人壽',
      department: get('idea-department') || '未填寫',
      members: get('idea-members') || '未填寫',
      title: get('idea-title'),
      dimension: get('idea-dimension') || '流程優化',
      analysisType: get('idea-analysis-type') || '可行性分析',
      idea: get('idea-content')
    };
  },
  buildIdeaAnalysisRows(type, idea, dimension) {
    const rows = {
      '可行性分析': [
        ['評估面向', '可行性判斷', '落地建議'],
        ['技術可行性', '可先以既有表單、知識庫、流程資料與 AI 輔助工具建立原型，不必一次串接所有核心系統。', '先做低風險 POC，確認輸入欄位、輸出格式、審核流程與使用者接受度。'],
        ['組織可行性', '提案與實際作業指標連結後，較容易取得業務、資訊、法遵等單位支持。', '先指定權責單位與試辦窗口，讓跨部門配合有明確節點。'],
        ['時程可行性', '若範圍控制在單一高頻場景，短期 3 到 6 個月內可完成試辦。', '以需求盤點、原型建置、小範圍測試、成效評估四階段推進。'],
        ['擴充可行性', `若「${dimension}」試辦成效明確，後續可複製到相似流程或其他通路。`, '用共同資料欄位、標準模板與成效指標降低擴大導入成本。']
      ],
      '成本效益分析': [
        ['項目', '可能投入', '預期效益'],
        ['建置成本', '需投入需求訪談、原型開發、資料整理、權限設定與測試人力。', '可先以小範圍試辦控制成本，避免一次導入過大。'],
        ['營運成本', '需安排知識內容維護、模型使用費、流程監控與使用者教育。', '若能減少重複作業與人工整理時間，長期可抵銷部分營運成本。'],
        ['量化效益', '需建立現況基準，例如處理時間、錯誤率、重工次數、滿意度。', '可追蹤節省工時、縮短等待時間、提高一次完成率與採用率。'],
        ['質化效益', '初期需投入溝通，讓使用者相信新流程。', '可提升服務一致性、知識留存、跨部門協作效率與創新形象。']
      ],
      '風險與因應分析': [
        ['風險類型', '可能情境', '因應措施'],
        ['資料與個資風險', '輸入內容可能包含客戶資料、內部流程或敏感資訊。', '設定資料遮罩、權限控管、禁止輸入個資與人工審核節點。'],
        ['AI 回覆品質風險', 'AI 產出可能不完整、不精準或不符合作業規範。', '以標準知識庫、檢核規則與人工確認降低誤用機率。'],
        ['導入阻力', '使用者可能擔心流程改變、責任不清或工具增加負擔。', '先從痛點明確的高頻場景試辦，並定義權責與回饋機制。'],
        ['維運風險', '若內容沒有人維護，工具品質會隨時間下降。', '指定資料維護窗口，定期檢視錯誤案例與成效指標。']
      ],
      '5W1H分析': [
        ['面向', '分析內容', '提案整理方向'],
        ['Why 為什麼', '目前存在效率、品質、一致性或體驗上的改善空間。', '明確描述痛點、影響範圍與不改善的成本。'],
        ['What 做什麼', `以「${idea.slice(0, 50)}${idea.length > 50 ? '...' : ''}」為核心建立可執行方案。`, '把構想拆成資料輸入、AI 輔助、人工確認與輸出應用。'],
        ['Who 誰參與', '使用者、權責單位、資訊單位、法遵或風控單位都可能需要參與。', '列出提案人、使用者、維運者與審核者。'],
        ['When 何時做', '適合先以短期試辦驗證，再依成效擴大。', '規劃 3 個月原型、6 個月試辦、1 年內評估擴大。'],
        ['How 如何做', '先定義資料、流程、權限、指標與回饋機制。', '用小範圍 POC 降低風險，再逐步標準化。']
      ],
      'KPI指標分析': [
        ['指標類型', '建議 KPI', '衡量方式'],
        ['效率指標', '平均處理時間、初稿產出時間、等待時間、人工整理工時。', '比較導入前後處理時間與節省工時。'],
        ['品質指標', '錯誤率、退件率、重工次數、一次完成率。', '抽樣檢核輸出品質，追蹤修正次數。'],
        ['使用指標', '使用人數、使用次數、採用率、回訪率。', '由系統紀錄或試辦回饋表統計。'],
        ['體驗指標', '使用者滿意度、內部回饋分數、客服或作業體驗改善。', '以問卷、訪談或服務評分追蹤。'],
        ['治理指標', '人工審核通過率、例外案件比例、資安或法遵事件數。', '由權責單位定期檢視。']
      ],
      '使用者旅程分析': [
        ['旅程階段', '使用者痛點', 'AI 輔助機會'],
        ['提出需求', '使用者不知道該提供哪些資料，導致反覆補件或說明不完整。', 'AI 引導輸入必要欄位，先整理成標準格式。'],
        ['資料整理', '人工彙整耗時，且不同人整理方式不一致。', 'AI 協助摘要、分類、比對缺漏與產生初稿。'],
        ['審核確認', '流程責任與審核重點不清，容易拖慢進度。', 'AI 提供檢核清單與風險提醒，保留人工決策。'],
        ['執行追蹤', '成效不易量化，後續改善缺乏依據。', 'AI 協助整理紀錄與產生成效報告，讓改善可追蹤。']
      ],
      '比較表格': [
        ['方案', '適用情境', '主要價值', '注意事項'],
        ['維持現況', '短期資源有限，暫不調整流程。', '不需額外投入，但問題改善有限。', '容易累積重複作業與服務落差。'],
        ['小規模試辦', `先針對「${dimension}」挑選一個流程或團隊測試。`, '可用低風險方式驗證效益，取得真實回饋。', '需要明確定義試辦範圍與衡量指標。'],
        ['正式導入', '試辦成果穩定後，擴大到更多單位使用。', '可形成標準化作業與長期改善機制。', '需安排教育訓練、權責分工與維運機制。']
      ],
      'SWOT分析': [
        ['面向', '內容', '建議作法'],
        ['優勢 Strength', '構想已聚焦在實際痛點，容易讓使用者理解改善方向。', '先整理高頻情境，優先處理最有感的問題。'],
        ['劣勢 Weakness', '初期可能缺少足夠資料或跨部門共識。', '用小型試辦累積案例，降低一次到位的壓力。'],
        ['機會 Opportunity', 'AI 工具可協助整理資訊、提醒風險、縮短人工作業時間。', '建立可量化指標，讓效益能被追蹤。'],
        ['威脅 Threat', '若流程沒有治理，可能出現品質不一致或權責不清。', '設定審核規則、資料權限與例外處理方式。']
      ],
      '優缺點清單': [
        ['項目', '觀察', '建議'],
        ['優點', '可把零散想法整理成明確流程，協助團隊更快對焦問題與目標。', '先從一個高頻流程開始，避免範圍過大。'],
        ['缺點', '若輸入資料不完整，產出內容可能需要人工補強。', '設計必要欄位與檢核清單，確保內容品質。'],
        ['風險', '導入 AI 輔助時需注意資料保護、審核責任與使用者信任。', '保留人工確認節點，並建立使用紀錄。'],
        ['成功條件', `提案需與「${dimension}」的實際工作指標連結。`, '以節省時間、降低錯誤、提升體驗等指標驗證。']
      ]
    };
    const selected = rows[type] || rows['可行性分析'];
    selected[1][1] = `${selected[1][1]} 目前構想重點為：${idea.slice(0, 80)}${idea.length > 80 ? '...' : ''}`;
    return selected;
  },
  renderIdeaTable(rows) {
    return tools.ideabox.renderIdeaTable(rows);
  },
  buildLocalIdeaBox(form) {
    const rows = this.buildIdeaAnalysisRows(form.analysisType, form.idea, form.dimension);
    return tools.ideabox.normalizeGeneratedIdea({
      analysisRows: rows,
      purpose: `本提案希望改善目前流程中資訊分散、人工整理耗時、回覆品質不易一致的問題。透過把「${form.title}」轉化為可執行的服務或作業設計，讓團隊在處理相關情境時能更快掌握重點，降低重複作業，並提升使用者感受與長期競爭力。`,
      description: `提案方向是以使用者輸入的構想為核心，建立一套清楚、可追蹤、可調整的作業流程。構想內容為：${form.idea}。實作上可先選定一個高頻場景試辦，整理所需資料欄位、處理步驟、審核節點與輸出格式，再逐步擴大到其他相似場景。`,
      aiApplication: 'AI 可擔任資料整理、初稿產生、重點摘要、風險提醒與內容一致性檢查的輔助角色。使用者輸入需求後，AI 先產生易讀版本，再由負責同仁確認正確性與合規性，保留人工判斷，避免完全自動化造成誤用。',
      expectedBenefits: '預期效益包含縮短初稿整理時間、降低遺漏重點的機率、讓跨部門溝通更容易對齊，並提升服務或內部作業的一致性。可用平均處理時間、重工次數、使用者滿意度、試辦採用率與錯誤率作為量化追蹤指標。',
      feasibility: '建議採短期試辦方式推進。三個月內完成需求盤點與原型，六個月內進行小範圍測試，一年內依結果評估是否擴大導入。此構想需要業務單位提供場景與資料範例，資訊或數位單位協助工具建置，法遵或風控單位確認資料與流程邊界。',
      cooperatingDepartment: form.department === '未填寫' ? '資訊處、流程權責單位、法遵或風控單位' : `${form.department}、資訊處、法遵或風控單位`,
      cooperationDetails: '提供試辦情境、確認資料權限、定義審核規則、追蹤成效指標。'
    }, form);
  },
  async handleIdeaBoxGenerate() {
    const form = this.getIdeaBoxFormData();
    if (!form.title || !form.idea) {
      alert('請至少填寫提案名稱與構想說明');
      return;
    }

    const output = document.getElementById('idea-output');
    const copyBtn = document.getElementById('idea-copy-btn');
    const downloadBtn = document.getElementById('idea-download-btn');
    const generateBtn = document.getElementById('idea-generate-btn');
    if (copyBtn) copyBtn.disabled = true;
    if (downloadBtn) downloadBtn.disabled = true;
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.textContent = '生成中...';
    }
    if (output) output.innerHTML = '<div class="idea-empty">正在生成提案內容...</div>';

    let data;
    let warning = '';
    try {
      const response = await fetch('/api/ideabox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'AI 生成失敗');
      data = tools.ideabox.normalizeGeneratedIdea(payload, form);
    } catch (error) {
      console.warn(error);
      data = this.buildLocalIdeaBox(form);
      warning = '<p class="idea-warning">AI API 尚未可用，已先產生本機範本。Cloudflare Secret 設定完成後會改用 AI 內容。</p>';
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = '生成提案書';
      }
    }

    window.ideaBoxData = data;
    window.ideaBoxHtml = tools.ideabox.buildIdeaBoxHtml(data);
    window.ideaBoxPlainText = tools.ideabox.buildIdeaBoxPlainText(data);

    if (output) output.innerHTML = `${warning}${window.ideaBoxHtml}`;
    if (copyBtn) copyBtn.disabled = false;
    if (downloadBtn) downloadBtn.disabled = false;
  },
  async copyIdeaBox() {
    if (!window.ideaBoxPlainText) return;
    await navigator.clipboard.writeText(window.ideaBoxPlainText);
    const btn = document.getElementById('idea-copy-btn');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '已複製';
      setTimeout(() => { btn.textContent = original; }, 1200);
    }
  },
  downloadIdeaBoxDoc() {
    if (!window.ideaBoxData) return;
    const title = (window.ideaBoxData.title || '未命名').replace(/[\\/:*?"<>|]/g, '_');
    const blob = tools.ideabox.buildIdeaBoxDocxBlob(window.ideaBoxData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IDEA_Box_提案書_${title}.docx`;
    a.click();
    URL.revokeObjectURL(url);
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
      resEl.innerHTML = `<span style="color:#FF5252">無法獲取匯率，請稍後再試。錯誤: ${escapeHTML(e.message)}</span>
      <div style="font-size:0.8rem;color:var(--muted);margin-top:8px;">(備註: 開源 API (Frankfurter) 無法跨行包含部分封閉國家的貨幣，例如新台幣 TWD 支援可能受限)</div>`;
    }
  },
  handleIdGen() {
    const city = document.getElementById('id-city')?.value || null;
    const gender = document.getElementById('id-gender')?.value || null;
    const serial = document.getElementById('id-serial')?.value?.trim() || null;
    const batch = parseInt(document.getElementById('id-batch')?.value || '1', 10);
    const out = document.getElementById('id-gen-output');
    if (!tools.id?.generate) { alert('產生器載入失敗'); return; }
    if (serial && !/^\d{7}$/.test(serial)) { alert('流水號必須為 7 碼純數字'); return; }
    const options = {};
    if (city) options.city = city;
    if (gender) options.gender = gender;
    if (serial) options.serial = serial;
    if (batch <= 1) {
      out.textContent = tools.id.generate(options);
    } else {
      const results = tools.id.generateBatch(batch, options);
      out.innerHTML = results.map(id => `<div>${escapeHTML(id)}</div>`).join('');
    }
  },
  handleIdVal() {
    const val = document.getElementById('id-val-input')?.value || '';
    const out = document.getElementById('id-val-output');
    if (!tools.id?.validate) { alert('驗證器載入失敗'); return; }
    const r = tools.id.validate(val);
    if (r.valid) {
      out.innerHTML = `
        <div style="color:#4CAF50; font-weight:bold; font-size:1.2rem; margin-bottom:12px;">✅ ${escapeHTML(r.msg)}</div>
        <table style="width:100%; text-align:left; font-size:0.95rem;">
          <tr><td style="color:var(--muted); padding:4px 8px;">字號</td><td style="padding:4px 8px; font-family:monospace; letter-spacing:2px;">${escapeHTML(r.input)}</td></tr>
          <tr><td style="color:var(--muted); padding:4px 8px;">縣市</td><td style="padding:4px 8px;">${escapeHTML(r.letter)} — ${escapeHTML(r.cityName)}</td></tr>
          <tr><td style="color:var(--muted); padding:4px 8px;">性別</td><td style="padding:4px 8px;">${escapeHTML(r.genderCode)} — ${escapeHTML(r.genderName)}</td></tr>
          <tr><td style="color:var(--muted); padding:4px 8px;">流水號</td><td style="padding:4px 8px; font-family:monospace;">${escapeHTML(r.serial)}</td></tr>
          <tr><td style="color:var(--muted); padding:4px 8px;">檢查碼</td><td style="padding:4px 8px; font-family:monospace;">${escapeHTML(r.checkDigit)}</td></tr>
        </table>`;
    } else {
      out.innerHTML = `<div style="color:#FF5252; font-weight:bold;">❌ ${escapeHTML(r.msg)}</div>`;
    }
  },
  handleUnitCatChange() {
    const catKey = document.getElementById('unit-cat').value;
    const cats = tools.unit?.getCategories?.() || [];
    const cat = cats.find(c => c.key === catKey);
    if (!cat) return;
    const opts = cat.units.map(u => `<option value="${u.key}">${u.label}</option>`).join('');
    document.getElementById('unit-from').innerHTML = opts;
    document.getElementById('unit-to').innerHTML = opts;
    this.handleUnitConvert();
  },
  handleUnitConvert() {
    const catKey = document.getElementById('unit-cat')?.value;
    const fromKey = document.getElementById('unit-from')?.value;
    const toKey = document.getElementById('unit-to')?.value;
    const val = parseFloat(document.getElementById('unit-val')?.value);
    const out = document.getElementById('unit-output');
    if (isNaN(val)) { out.textContent = '請輸入有效數值'; return; }
    const result = tools.unit?.convert?.(catKey, fromKey, toKey, val);
    if (result === null || result === undefined) { out.textContent = '換算失敗'; return; }
    const fromLabel = document.getElementById('unit-from').options[document.getElementById('unit-from').selectedIndex]?.text || fromKey;
    const toLabel   = document.getElementById('unit-to').options[document.getElementById('unit-to').selectedIndex]?.text || toKey;
    out.innerHTML = `<span style="color:var(--accent); font-size:2rem;">${result.toLocaleString(undefined, {maximumFractionDigits: 8})}</span><br><span style="font-size:0.85rem;color:var(--text-muted);">${val} ${fromLabel} = ${result.toLocaleString(undefined, {maximumFractionDigits: 8})} ${toLabel}</span>`;
  },
  imgZipFiles: [],
  handleImgZipFiles() {
    const input = document.getElementById('imgzip-file');
    const files = Array.from(input.files || []);
    if (!files.length) return;

    this.imgZipFiles = files;
    const listEl = document.getElementById('imgzip-list');
    const dropText = document.querySelector('.imgzip-drop-text');
    if (dropText) dropText.textContent = `📁 已選取 ${files.length} 張圖片，點擊可更換`;

    listEl.innerHTML = files.map((file, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.03);border:1px solid var(--border-light);border-radius:8px;">
        <div style="flex:0 0 60px;text-align:center;font-size:0.75rem;color:var(--muted);">
          <img src="${URL.createObjectURL(file)}" style="max-width:60px;max-height:60px;border-radius:4px;display:block;margin-bottom:4px;" />
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(file.name)}</div>
          <div style="font-size:0.75rem;color:var(--muted);">原始 ${tools.imgzip.formatSize(file.size)}</div>
        </div>
        <div style="flex:0 0 auto;text-align:right;" id="imgzip-result-${i}">
          <span style="color:var(--muted);font-size:0.8rem;">等待壓縮</span>
        </div>
        <div style="flex:0 0 auto;">
          <a id="imgzip-dl-${i}" class="btn btn-sm" style="display:none;" download>⬇️</a>
        </div>
      </div>
    `).join('');

    document.getElementById('imgzip-actions').style.display = 'block';
    this.handleImgZipRecompress();
  },
  async handleImgZipRecompress() {
    if (!this.imgZipFiles.length) return;
    const quality = parseInt(document.getElementById('imgzip-quality')?.value || 80) / 100;
    const format = document.getElementById('imgzip-format')?.value || 'webp';
    const ext = tools.imgzip.OUT_FORMATS[format]?.ext || '.webp';

    let totalOriginal = 0;
    let totalCompressed = 0;

    for (let i = 0; i < this.imgZipFiles.length; i++) {
      const file = this.imgZipFiles[i];
      const resultEl = document.getElementById(`imgzip-result-${i}`);
      const dlEl = document.getElementById(`imgzip-dl-${i}`);
      if (!resultEl) continue;

      resultEl.innerHTML = '<span style="color:var(--muted);font-size:0.8rem;">壓縮中...</span>';

      try {
        const result = await tools.imgzip.compress(file, quality, format);
        const saved = tools.imgzip.savingsPercent(file.size, result.size);
        const color = saved > 50 ? '#81c784' : saved > 20 ? '#ffc107' : '#ff9800';

        resultEl.innerHTML = `
          <div style="color:var(--muted);font-size:0.75rem;">${tools.imgzip.formatSize(result.size)}</div>
          <div style="color:${color};font-size:0.85rem;font-weight:600;">節省 ${saved}%</div>
          ${result.fallback ? '<div style="color:#ffc107;font-size:0.7rem;">(AVIF 不支援→WebP)</div>' : ''}
        `;

        if (dlEl) {
          dlEl.style.display = 'inline-flex';
          dlEl.href = result.dataUrl;
          const baseName = file.name.replace(/\.[^.]+$/, '');
          dlEl.download = `${baseName}_q${Math.round(quality * 100)}${ext}`;
        }

        totalOriginal += file.size;
        totalCompressed += result.size;

        // Store result for batch download
        if (!file._compressResult) file._compressResult = {};
        file._compressResult = result;
      } catch (e) {
        resultEl.innerHTML = `<span style="color:#e57373;font-size:0.8rem;">壓縮失敗</span>`;
      }
    }

    // Update total stats
    const countEl = document.getElementById('imgzip-total-count');
    const savedEl = document.getElementById('imgzip-total-saved');
    const percentEl = document.getElementById('imgzip-total-percent');
    const statsEl = document.getElementById('imgzip-total-stats');

    if (totalOriginal > 0) {
      const totalSaved = totalOriginal - totalCompressed;
      const totalPercent = Math.round((totalSaved / totalOriginal) * 100);
      if (countEl) countEl.textContent = this.imgZipFiles.length;
      if (savedEl) savedEl.textContent = tools.imgzip.formatSize(totalSaved);
      if (percentEl) percentEl.textContent = `${totalPercent}%`;
      if (statsEl) statsEl.style.display = 'block';
    }
  },
  handleImgZipDownloadAll() {
    if (!this.imgZipFiles.length) return;
    this.imgZipFiles.forEach((file, i) => {
      const result = file._compressResult;
      if (result?.dataUrl) {
        setTimeout(() => {
          const ext = tools.imgzip.OUT_FORMATS[result.format]?.ext || '.webp';
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const a = document.createElement('a');
          a.href = result.dataUrl;
          a.download = `${baseName}${ext}`;
          a.click();
        }, i * 200);
      }
    });
  },
  // ─── 影片壓縮相關 ───
  videoZipFile: null,
  videoZipTargetMB: 10,
  handleVideoZipFile() {
    const input = document.getElementById('videozip-file');
    const file = input.files?.[0];
    if (!file) return;

    // 大小限制 2GB
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('檔案超過 2GB，請選擇較小的影片');
      return;
    }

    this.videoZipFile = file;
    this.videoZipTargetMB = 10;

    // 顯示檔案資訊
    const dropText = document.getElementById('videozip-drop-text');
    if (dropText) dropText.textContent = `🎬 ${file.name}`;

    document.getElementById('videozip-info-name').textContent = file.name;
    document.getElementById('videozip-info-size').textContent = tools.videozip.formatSize(file.size);
    document.getElementById('videozip-info').style.display = 'block';
    document.getElementById('videozip-controls').style.display = 'block';
    document.getElementById('videozip-result').style.display = 'none';
    document.getElementById('videozip-progress').style.display = 'none';

    // 取得影片尺寸與時長
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      document.getElementById('videozip-info-dims').textContent = `${video.videoWidth}×${video.videoHeight}`;
      const mins = Math.floor(video.duration / 60);
      const secs = Math.floor(video.duration % 60);
      document.getElementById('videozip-info-dur').textContent = `${mins}:${String(secs).padStart(2,'0')}`;
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);

    // 繪製預設按鈕
    const presetsEl = document.getElementById('videozip-presets');
    presetsEl.innerHTML = tools.videozip.PRESETS.map((p, i) => {
      const active = i === 1 ? 'preset-active' : ''; // 預設選 Discord 10MB
      return `<button class="preset-btn ${active}" data-index="${i}" data-size="${p.size}" onclick="UI.selectVideoPreset(this)">
        ${p.label}
      </button>`;
    }).join('');
  },
  selectVideoPreset(btn) {
    // 更新選中狀態
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('preset-active'));
    btn.classList.add('preset-active');

    const targetSize = parseInt(btn.dataset.size);
    const customGroup = document.getElementById('videozip-custom-group');

    if (targetSize === -1) {
      customGroup.style.display = 'block';
      this.videoZipTargetMB = parseInt(document.getElementById('videozip-custom-mb').value) || 50;
    } else {
      customGroup.style.display = 'none';
      this.videoZipTargetMB = targetSize;
    }
  },
  async handleVideoZipCompress() {
    if (!this.videoZipFile) return;

    // 如果是自訂大小，讀取輸入值
    if (document.getElementById('videozip-custom-group').style.display !== 'none') {
      this.videoZipTargetMB = parseInt(document.getElementById('videozip-custom-mb').value) || 50;
    }

    // 隱藏控制項，顯示進度
    document.getElementById('videozip-controls').style.display = 'none';
    document.getElementById('videozip-progress').style.display = 'block';
    document.getElementById('videozip-result').style.display = 'none';

    const progressBar = document.getElementById('videozip-progress-bar');
    const progressPct = document.getElementById('videozip-progress-pct');
    const statusText = document.getElementById('videozip-status-text');

    try {
      statusText.textContent = '正在分析影片...';
      const result = await tools.videozip.compress(
        this.videoZipFile,
        this.videoZipTargetMB,
        (pct) => {
          progressBar.style.width = pct + '%';
          progressPct.textContent = pct + '%';
          if (pct < 50) statusText.textContent = '正在壓縮...';
          else if (pct < 90) statusText.textContent = '封裝中...';
          else statusText.textContent = '完成！';
        }
      );

      const saved = tools.videozip.savingsPercent(this.videoZipFile.size, result.blob.size);
      document.getElementById('videozip-result-stats').textContent =
        `${tools.videozip.formatSize(this.videoZipFile.size)} → ${tools.videozip.formatSize(result.blob.size)} · 節省 ${saved}%`;
      document.getElementById('videozip-result-mode').textContent =
        `模式：${result.mode || '自動'} · 格式：${result.ext}`;

      const url = URL.createObjectURL(result.blob);
      const dlLink = document.getElementById('videozip-dl-link');
      dlLink.href = url;
      const baseName = this.videoZipFile.name.replace(/\.[^.]+$/, '');
      dlLink.download = `${baseName}_compressed${result.ext}`;

      document.getElementById('videozip-progress').style.display = 'none';
      document.getElementById('videozip-result').style.display = 'block';
      document.getElementById('videozip-controls').style.display = 'block';
    } catch (e) {
      statusText.textContent = '壓縮失敗：' + (e.message || '未知錯誤');
      progressBar.style.background = '#e57373';
    }
  },
  // ─── 影片轉 GIF ───
  v2gFile: null,
  v2gPreset: { width: 480, fps: 15 },
  handleV2GFile() {
    const input = document.getElementById('v2g-file');
    const file = input.files?.[0];
    if (!file) return;

    this.v2gFile = file;

    document.getElementById('v2g-drop-text').textContent = `🎬 ${file.name}`;
    document.getElementById('v2g-info-name').textContent = file.name;
    document.getElementById('v2g-info-size').textContent = tools.video2gif.formatSize(file.size);
    document.getElementById('v2g-info').style.display = 'block';
    document.getElementById('v2g-controls').style.display = 'block';
    document.getElementById('v2g-result').style.display = 'none';
    document.getElementById('v2g-progress').style.display = 'none';

    // 取得時長
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const dur = video.duration;
      document.getElementById('v2g-info-dur').textContent = tools.video2gif.formatTime(dur);
      document.getElementById('v2g-end').max = Math.ceil(dur);
      document.getElementById('v2g-end').value = Math.min(3, dur);
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);

    // 預設按鈕
    const presetsEl = document.getElementById('v2g-presets');
    presetsEl.innerHTML = tools.video2gif.PRESETS.map((p, i) => {
      const active = i === 1 ? 'preset-active' : '';
      return `<button class="preset-btn ${active}" data-index="${i}" data-w="${p.width}" data-fps="${p.fps}" onclick="UI.selectV2GPreset(this)">
        ${p.label}
      </button>`;
    }).join('');
    this.v2gPreset = { width: tools.video2gif.PRESETS[1].width, fps: tools.video2gif.PRESETS[1].fps };
  },
  selectV2GPreset(btn) {
    document.querySelectorAll('#v2g-presets .preset-btn').forEach(b => b.classList.remove('preset-active'));
    btn.classList.add('preset-active');
    const w = parseInt(btn.dataset.w);
    const fps = parseInt(btn.dataset.fps);
    if (w === -1) {
      document.getElementById('v2g-custom-group').style.display = 'block';
      this.v2gPreset = {
        width: parseInt(document.getElementById('v2g-custom-w')?.value || 480),
        fps: parseInt(document.getElementById('v2g-custom-fps')?.value || 15),
      };
    } else {
      document.getElementById('v2g-custom-group').style.display = 'none';
      this.v2gPreset = { width: w, fps };
    }
  },
  async handleV2GConvert() {
    if (!this.v2gFile) return;

    if (document.getElementById('v2g-custom-group').style.display !== 'none') {
      this.v2gPreset = {
        width: parseInt(document.getElementById('v2g-custom-w').value) || 480,
        fps: parseInt(document.getElementById('v2g-custom-fps').value) || 15,
      };
    }

    const startTime = parseFloat(document.getElementById('v2g-start').value) || 0;
    const endTime = parseFloat(document.getElementById('v2g-end').value) || 3;

    document.getElementById('v2g-controls').style.display = 'none';
    document.getElementById('v2g-progress').style.display = 'block';
    document.getElementById('v2g-result').style.display = 'none';

    const bar = document.getElementById('v2g-progress-bar');
    const pct = document.getElementById('v2g-progress-pct');
    const status = document.getElementById('v2g-status-text');

    try {
      const result = await tools.video2gif.convert(this.v2gFile, {
        startTime, endTime,
        maxWidth: this.v2gPreset.width,
        fps: this.v2gPreset.fps,
      }, (p) => {
        bar.style.width = p + '%';
        pct.textContent = p + '%';
        if (p < 90) status.textContent = '擷取畫面中...';
        else status.textContent = '編碼 GIF 中...';
      });

      document.getElementById('v2g-result-stats').textContent =
        `${result.frames} 幀 · ${tools.video2gif.formatSize(result.blob.size)}`;

      const url = URL.createObjectURL(result.blob);
      document.getElementById('v2g-preview').src = url;
      document.getElementById('v2g-dl-link').href = url;
      document.getElementById('v2g-dl-link').download =
        this.v2gFile.name.replace(/\.[^.]+$/, '') + '.gif';

      document.getElementById('v2g-progress').style.display = 'none';
      document.getElementById('v2g-result').style.display = 'block';
      document.getElementById('v2g-controls').style.display = 'block';
    } catch (e) {
      status.textContent = '轉換失敗：' + (e.message || '未知錯誤');
      bar.style.background = '#e57373';
    }
  },
  toggleSearch() {
    let overlay = document.getElementById('search-overlay');
    if (overlay) {
      overlay.remove();
      return;
    }
    const toolsList = Object.entries(metaList).map(([k, meta]) => ({ key: k, icon: meta.icon, title: meta.title, desc: meta.desc }));
    overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-backdrop" onclick="UI.toggleSearch()"></div>
      <div class="search-modal">
        <div class="search-input-wrap">
          <span style="color:var(--accent);font-size:1.2rem;">🔍</span>
          <input id="search-input" class="search-input" placeholder="搜尋工具... (例如：PDF、圖片、密碼)" autofocus />
          <span style="color:var(--muted);font-size:0.75rem;">ESC 關閉</span>
        </div>
        <div id="search-results" class="search-results">
          ${toolsList.map(t => `
            <div class="search-item" data-key="${t.key}" onclick="UI.searchSelect('${t.key}')">
              <span class="search-item-icon">${t.icon}</span>
              <div>
                <div class="search-item-title">${escapeHTML(t.title)}</div>
                <div class="search-item-desc">${escapeHTML(t.desc)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = document.getElementById('search-input');
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.search-item').forEach(item => {
        const key = item.dataset.key;
        const meta = metaList[key];
        const match = !q || (meta.title.toLowerCase().includes(q) || meta.desc.toLowerCase().includes(q) || key.includes(q));
        item.style.display = match ? 'flex' : 'none';
      });
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.toggleSearch();
      if (e.key === 'Enter') {
        const visible = document.querySelector('.search-item[style*="flex"]') || document.querySelector('.search-item:not([style*="none"])');
        if (visible) this.searchSelect(visible.dataset.key);
      }
    });
    setTimeout(() => input.focus(), 50);
  },
  searchSelect(key) {
    document.getElementById('search-overlay')?.remove();
    this.navigate(`/${key}`);
  },

  pdfDoc: null,
  pdfFile: null,
  pdfPageNum: 1,
  pdfScale: 1.25,
  pdfFitMode: false,
  pdfRendering: false,
  pdfPendingPage: null,

  async _pdfRender() {
    if (!this.pdfDoc) return;
    const viewer = document.getElementById('pdf-viewer');
    if (!viewer) return;
    if (this.pdfRendering) { this.pdfPendingPage = this.pdfPageNum; return; }
    this.pdfRendering = true;
    try {
      let scale = this.pdfScale;
      if (this.pdfFitMode) {
        const page = await this.pdfDoc.getPage(this.pdfPageNum);
        const vp = page.getViewport({ scale: 1 });
        const avail = viewer.clientWidth - 24;
        scale = Math.max(0.25, avail / vp.width);
        this.pdfScale = scale;
      }
      await tools.pdftext.renderPdfPage(this.pdfDoc, viewer, { pageNum: this.pdfPageNum, scale });
      const pageInput = document.getElementById('pdf-page-input');
      if (pageInput) pageInput.value = String(this.pdfPageNum);
      const zoomLabel = document.getElementById('pdf-zoom-label');
      if (zoomLabel) zoomLabel.textContent = Math.round(scale * 100) + '%';
    } catch (e) {
      const status = document.getElementById('pdf-status');
      if (status) { status.style.display = 'block'; status.textContent = '❌ 渲染失敗：' + (e.message || e); }
    } finally {
      this.pdfRendering = false;
      if (this.pdfPendingPage != null) {
        const p = this.pdfPendingPage; this.pdfPendingPage = null;
        this.pdfPageNum = p; this._pdfRender();
      }
    }
  },

  async handlePdfFileChange() {
    const file = document.getElementById('pdf-file')?.files?.[0];
    const dropText = document.getElementById('pdf-drop-text');
    const status = document.getElementById('pdf-status');
    const toolbar = document.getElementById('pdf-toolbar');
    const viewer = document.getElementById('pdf-viewer');
    if (!file) return;
    if (dropText) dropText.textContent = `📄 ${file.name}（點擊更換）`;
    if (file.size > 50 * 1024 * 1024) {
      if (status) { status.style.display = 'block'; status.textContent = `❌ 檔案 ${(file.size/1024/1024).toFixed(1)}MB 超過 50MB 上限`; }
      return;
    }
    this.pdfFile = file;
    if (status) { status.style.display = 'block'; status.textContent = '⏳ 載入 PDF…'; }
    try {
      this.pdfDoc = await tools.pdftext.loadPdfDocument(file);
      this.pdfPageNum = 1;
      this.pdfFitMode = true;
      const total = this.pdfDoc.numPages;
      document.getElementById('pdf-page-total').textContent = String(total);
      const pageInput = document.getElementById('pdf-page-input');
      if (pageInput) pageInput.max = String(total);
      toolbar.style.display = 'flex';
      viewer.style.display = 'block';
      if (status) status.style.display = 'none';
      await this._pdfRender();
    } catch (e) {
      if (status) { status.style.display = 'block'; status.textContent = '❌ 載入失敗：' + (e.message || e); }
    }
  },

  handlePdfPage(delta) {
    if (!this.pdfDoc) return;
    const total = this.pdfDoc.numPages;
    const next = Math.min(total, Math.max(1, this.pdfPageNum + delta));
    if (next === this.pdfPageNum) return;
    this.pdfPageNum = next;
    this._pdfRender();
  },

  handlePdfJump() {
    if (!this.pdfDoc) return;
    const input = document.getElementById('pdf-page-input');
    const n = Math.min(this.pdfDoc.numPages, Math.max(1, parseInt(input.value, 10) || 1));
    this.pdfPageNum = n;
    input.value = String(n);
    this._pdfRender();
  },

  handlePdfZoom(mode) {
    if (!this.pdfDoc) return;
    if (mode === 0) { this.pdfFitMode = true; }
    else {
      this.pdfFitMode = false;
      const step = 0.2;
      this.pdfScale = Math.min(4, Math.max(0.25, this.pdfScale + (mode > 0 ? step : -step)));
    }
    this._pdfRender();
  },

  handlePdfPrint() {
    if (!this.pdfFile) return;
    const url = URL.createObjectURL(this.pdfFile);
    const w = window.open(url, '_blank');
    if (w) setTimeout(() => { try { w.print(); } catch {} }, 800);
  },

  // ============ Tab 切換 ============
  switchPdfTab(tab) {
    document.querySelectorAll('.pdf-tab').forEach(b => {
      b.classList.toggle('pdf-tab-active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.pdf-tab-panel').forEach(p => {
      p.style.display = p.id === `pdf-tab-${tab}` ? '' : 'none';
    });
  },

  // ============ C3: PDF → 圖片 zip ============
  pdfExportDoc: null,
  pdfExportFile: null,

  async handlePdfExportFile() {
    const file = document.getElementById('pdf-export-file')?.files?.[0];
    if (!file) return;
    const drop = document.getElementById('pdf-export-drop-text');
    const opts = document.getElementById('pdf-export-options');
    const status = document.getElementById('pdf-export-status');
    if (drop) drop.textContent = `📄 ${file.name}（點擊更換）`;
    if (status) { status.style.display = 'block'; status.textContent = '⏳ 載入中…'; }
    try {
      this.pdfExportFile = file;
      this.pdfExportDoc = await tools.pdftext.loadPdfDocument(file);
      const total = this.pdfExportDoc.numPages;
      const rangeInput = document.getElementById('pdf-export-range');
      if (rangeInput) rangeInput.placeholder = `all（共 ${total} 頁）`;
      if (opts) opts.style.display = 'block';
      if (status) status.textContent = `✅ 已載入，共 ${total} 頁`;
    } catch (e) {
      if (status) status.textContent = '❌ 載入失敗：' + (e.message || e);
    }
  },

  async handlePdfExportRun() {
    if (!this.pdfExportDoc) return;
    const dpi = parseInt(document.getElementById('pdf-export-dpi').value, 10);
    const mime = document.getElementById('pdf-export-format').value;
    const rangeStr = document.getElementById('pdf-export-range').value;
    const total = this.pdfExportDoc.numPages;
    const pages = tools.pdftext.parsePageRange(rangeStr, total);
    const status = document.getElementById('pdf-export-status');
    const progress = document.getElementById('pdf-export-progress');
    const bar = document.getElementById('pdf-export-bar');
    const text = document.getElementById('pdf-export-text');

    if (!pages.length) {
      if (status) { status.style.display = 'block'; status.textContent = '⚠️ 頁範圍無效，請檢查格式'; }
      return;
    }

    const ext = mime === 'image/jpeg' ? '.jpg' : mime === 'image/webp' ? '.webp' : '.png';
    const baseName = (this.pdfExportFile?.name || 'pages').replace(/\.pdf$/i, '');

    if (progress) progress.style.display = 'block';
    if (status) { status.style.display = 'block'; status.textContent = `⏳ 正在渲染 ${pages.length} 頁…`; }

    try {
      const JSZipLib = await tools.pdftext.loadJSZip();
      const zip = new JSZipLib();
      const padLen = String(total).length;
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        if (text) text.textContent = `渲染第 ${p} 頁 (${i + 1}/${pages.length})…`;
        if (bar) bar.style.width = `${((i + 1) / pages.length) * 100}%`;
        const { blob } = await tools.pdftext.renderPageToBlob(this.pdfExportDoc, p, { dpi, mime });
        const fname = `${baseName}_p${String(p).padStart(padLen, '0')}${ext}`;
        zip.file(fname, blob);
      }
      if (text) text.textContent = '打包 zip…';
      const zipBlob = await zip.generateAsync({ type: 'blob' }, ({ percent }) => {
        if (bar) bar.style.width = `${percent}%`;
      });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_images.zip`;
      a.click();
      URL.revokeObjectURL(url);
      const mb = (zipBlob.size / 1024 / 1024).toFixed(2);
      if (status) status.textContent = `✅ 已下載 ${pages.length} 張圖片 (${mb} MB)`;
      if (progress) setTimeout(() => { progress.style.display = 'none'; }, 1500);
    } catch (e) {
      if (status) status.textContent = '❌ 失敗：' + (e.message || e);
      if (progress) progress.style.display = 'none';
    }
  },

  // ============ C2: 編輯頁面（拆/合/旋/重排）============
  // pdfEditPages: [{ docIdx:number, pageIdx:number(0-based原檔頁), rot:0|90|180|270, thumb:dataURL }]
  pdfEditDocs: [],     // pdf.js documents（縮圖用）
  pdfEditLibDocs: [],  // pdf-lib documents（匯出用）
  pdfEditFiles: [],
  pdfEditPages: [],
  pdfEditSelected: new Set(), // Set<index in pdfEditPages>
  pdfEditDragIdx: null,

  async handlePdfEditFiles() {
    const input = document.getElementById('pdf-edit-file');
    const files = input?.files;
    if (!files?.length) return;
    const status = document.getElementById('pdf-edit-status');
    const drop = document.getElementById('pdf-edit-drop-text');
    if (status) { status.style.display = 'block'; status.textContent = `⏳ 載入 ${files.length} 個 PDF…`; }

    try {
      const PDFLib = await tools.pdftext.loadPdfLib();
      for (const f of Array.from(files)) {
        const docIdx = this.pdfEditDocs.length;
        const buf = await f.arrayBuffer();
        // 兩份：pdf.js 拿縮圖 + pdf-lib 拿頁來重組
        const jsDoc = await tools.pdftext.loadPdfDocument(new Blob([buf]));
        const libDoc = await PDFLib.PDFDocument.load(buf);
        this.pdfEditDocs.push(jsDoc);
        this.pdfEditLibDocs.push(libDoc);
        this.pdfEditFiles.push(f);
        for (let i = 0; i < jsDoc.numPages; i++) {
          this.pdfEditPages.push({ docIdx, pageIdx: i, rot: 0, thumb: null });
        }
      }
      if (drop) drop.textContent = `📄 已載入 ${this.pdfEditFiles.length} 個檔（點擊新增）`;
      // 重置 selection
      this.pdfEditSelected.clear();
      this._renderPdfEditGrid();
      // lazy render thumbnails
      this._renderEditThumbnails();
      if (status) status.textContent = `✅ 已載入 ${this.pdfEditPages.length} 頁，可拖曳重排、旋轉、刪除、勾選後匯出。`;
      document.getElementById('pdf-edit-toolbar').style.display = 'flex';
      document.getElementById('pdf-edit-grid').style.display = 'grid';
      // 清空 input 才能重複選同一檔
      input.value = '';
    } catch (e) {
      if (status) status.textContent = '❌ 載入失敗：' + (e.message || e);
    }
  },

  async _renderEditThumbnails() {
    // 依目前 pdfEditPages 順序逐張產生縮圖（背景跑）
    for (let i = 0; i < this.pdfEditPages.length; i++) {
      const p = this.pdfEditPages[i];
      if (p.thumb) continue;
      try {
        p.thumb = await tools.pdftext.renderThumbnail(this.pdfEditDocs[p.docIdx], p.pageIdx + 1, { maxSize: 180 });
        const img = document.querySelector(`.pdf-thumb[data-idx="${i}"] img`);
        if (img) img.src = p.thumb;
      } catch {}
    }
  },

  _renderPdfEditGrid() {
    const grid = document.getElementById('pdf-edit-grid');
    if (!grid) return;
    const count = document.getElementById('pdf-edit-count');
    if (count) count.textContent = String(this.pdfEditPages.length);
    grid.innerHTML = this.pdfEditPages.map((p, idx) => {
      const fileName = this.pdfEditFiles[p.docIdx]?.name || '';
      const selected = this.pdfEditSelected.has(idx) ? 'pdf-thumb-selected' : '';
      const rotCSS = p.rot ? `transform:rotate(${p.rot}deg);` : '';
      return `
        <div class="pdf-thumb ${selected}" data-idx="${idx}" draggable="true"
             ondragstart="UI.handlePdfEditDragStart(event,${idx})"
             ondragover="event.preventDefault()"
             ondragenter="event.currentTarget.classList.add('pdf-thumb-dragover')"
             ondragleave="event.currentTarget.classList.remove('pdf-thumb-dragover')"
             ondrop="UI.handlePdfEditDrop(event,${idx})"
             onclick="UI.handlePdfEditToggle(${idx})">
          <div class="pdf-thumb-img-wrap">
            <img src="${p.thumb || ''}" alt="p${p.pageIdx+1}" style="${rotCSS}" />
          </div>
          <div class="pdf-thumb-meta">
            <span>#${idx+1}</span>
            <span title="${escapeHTML(fileName)}">${escapeHTML(fileName.length > 14 ? fileName.slice(0,12)+'…' : fileName)} p${p.pageIdx+1}</span>
          </div>
          <div class="pdf-thumb-actions">
            <button class="pdf-thumb-btn" title="左轉" onclick="event.stopPropagation(); UI.handlePdfEditRotate(${idx},-90)">↺</button>
            <button class="pdf-thumb-btn" title="右轉" onclick="event.stopPropagation(); UI.handlePdfEditRotate(${idx},90)">↻</button>
            <button class="pdf-thumb-btn pdf-thumb-btn-danger" title="刪除" onclick="event.stopPropagation(); UI.handlePdfEditDelete(${idx})">✕</button>
          </div>
        </div>`;
    }).join('');
  },

  handlePdfEditToggle(idx) {
    if (this.pdfEditSelected.has(idx)) this.pdfEditSelected.delete(idx);
    else this.pdfEditSelected.add(idx);
    this._renderPdfEditGrid();
  },

  handlePdfEditSelectAll(all) {
    this.pdfEditSelected.clear();
    if (all) {
      for (let i = 0; i < this.pdfEditPages.length; i++) this.pdfEditSelected.add(i);
    }
    this._renderPdfEditGrid();
  },

  handlePdfEditRotate(idx, delta) {
    const p = this.pdfEditPages[idx];
    if (!p) return;
    p.rot = ((p.rot + delta) % 360 + 360) % 360;
    this._renderPdfEditGrid();
  },

  handlePdfEditDelete(idx) {
    this.pdfEditPages.splice(idx, 1);
    // 重編 selected 索引
    const newSel = new Set();
    this.pdfEditSelected.forEach(i => {
      if (i < idx) newSel.add(i);
      else if (i > idx) newSel.add(i - 1);
    });
    this.pdfEditSelected = newSel;
    this._renderPdfEditGrid();
  },

  handlePdfEditDragStart(e, idx) {
    this.pdfEditDragIdx = idx;
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(idx)); } catch {}
  },

  handlePdfEditDrop(e, targetIdx) {
    e.preventDefault();
    e.currentTarget.classList.remove('pdf-thumb-dragover');
    const from = this.pdfEditDragIdx;
    this.pdfEditDragIdx = null;
    if (from == null || from === targetIdx) return;
    const moved = this.pdfEditPages.splice(from, 1)[0];
    // 算插入位置
    const insertAt = from < targetIdx ? targetIdx : targetIdx;
    this.pdfEditPages.splice(insertAt, 0, moved);
    // 重編 selected 索引
    const remap = new Map();
    let cur = 0;
    // 簡化：清掉選取
    this.pdfEditSelected.clear();
    this._renderPdfEditGrid();
  },

  handlePdfEditReset() {
    this.pdfEditDocs = [];
    this.pdfEditLibDocs = [];
    this.pdfEditFiles = [];
    this.pdfEditPages = [];
    this.pdfEditSelected.clear();
    document.getElementById('pdf-edit-toolbar').style.display = 'none';
    const grid = document.getElementById('pdf-edit-grid');
    if (grid) { grid.style.display = 'none'; grid.innerHTML = ''; }
    const status = document.getElementById('pdf-edit-status');
    if (status) status.style.display = 'none';
    const drop = document.getElementById('pdf-edit-drop-text');
    if (drop) drop.textContent = '📁 拖曳一或多個 PDF（會自動合併）';
  },

  async handlePdfEditSave() {
    if (!this.pdfEditPages.length) return;
    const status = document.getElementById('pdf-edit-status');
    if (status) { status.style.display = 'block'; status.textContent = '⏳ 組裝中…'; }
    try {
      const PDFLib = await tools.pdftext.loadPdfLib();
      const out = await PDFLib.PDFDocument.create();
      // 決定要匯出哪些頁：若有選取，只匯選取的；否則匯全部
      const exportIdxs = this.pdfEditSelected.size
        ? [...this.pdfEditSelected].sort((a,b)=>a-b)
        : this.pdfEditPages.map((_, i) => i);
      for (const idx of exportIdxs) {
        const p = this.pdfEditPages[idx];
        const [copied] = await out.copyPages(this.pdfEditLibDocs[p.docIdx], [p.pageIdx]);
        if (p.rot) copied.setRotation(PDFLib.degrees((copied.getRotation().angle + p.rot) % 360));
        out.addPage(copied);
      }
      const bytes = await out.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const base = this.pdfEditFiles.length === 1
        ? this.pdfEditFiles[0].name.replace(/\.pdf$/i, '')
        : 'merged';
      a.href = url;
      a.download = `${base}_edited.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      const mb = (blob.size / 1024 / 1024).toFixed(2);
      if (status) status.textContent = `✅ 已下載 ${exportIdxs.length} 頁 (${mb} MB)`;
    } catch (e) {
      if (status) status.textContent = '❌ 失敗：' + (e.message || e);
    }
  },

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

  const cardClass = route === 'pdf' ? 'card card--compact' : 'card';
  app.innerHTML = `
    <div class="${cardClass}">
      <h2>${meta.title}</h2>
      <p style="color:var(--muted);margin-top:4px">${meta.desc}</p>
      ${renderFields[route]?.() || '<p>頁面未找到</p>'}
    </div>
  `;


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
    UI.initTZ();
    if (tzTimer) clearInterval(tzTimer);
    tzTimer = setInterval(() => UI.updateTZDisplay(), 1000);
  } else if (route === 'fx') {
    document.getElementById('fx-amt')?.addEventListener('input', () => UI.handleFX());
    UI.handleFX();
  } else {
    if (tzTimer) {
      clearInterval(tzTimer);
      tzTimer = null;
    }
  }
}

window.addEventListener('popstate', renderRoute);
window.addEventListener('DOMContentLoaded', () => {
  if (location.hash.startsWith('#/')) {
    const cleanPath = location.hash.replace('#', '');
    history.replaceState(null, '', cleanPath);
  }
  renderRoute();
});

// 快捷指令列：Ctrl+K / Cmd+K 全域搜尋
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    UI.toggleSearch();
  }
});
