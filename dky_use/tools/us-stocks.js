/* DKY US Stocks - 美股投資組合追蹤工具
 * 功能：密碼保護、股價即時更新、損益計算、Google Sheets 同步
 * 股價來源：Yahoo Finance v8 API (免費)
 */

const US_STOCKS_STORAGE = 'dky_us_stocks_v1';

// ── SHA-256 實作 (純 JavaScript, 無外部依賴) ──
async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Config ──
const STOCK_CONFIG = {
  // 密碼 SHA-256 hash (預設: "dky2026")
  passwordHash: '43c7888984dce5550b5abb63ca77ac83866da682f21e5ce6ddeb714b4b00ba8e',
  // 價格快取時間 (分鐘)
  cacheMinutes: 5,
  // Google Apps Script Web App URL (用戶部署後填入)
  gasUrl: '',
  // 常用美股清單 (用於快速選股)
  popularStocks: [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Alphabet (Google)' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'META', name: 'Meta' },
  ],
};

// ── State ──
let stockState = {
  authenticated: false,
  portfolio: [],       // { symbol, name, shares, avgCost, buyDate }
  prices: {},          // { symbol: { price, change, changePercent, updatedAt } }
  editing: null,       // 編輯中的 index
};
let _updateTimer = null;

// ── Portfolio CRUD ──
function loadPortfolio() {
  try {
    const raw = localStorage.getItem(US_STOCKS_STORAGE);
    if (raw) stockState.portfolio = JSON.parse(raw);
  } catch { stockState.portfolio = []; }
}

function savePortfolio() {
  localStorage.setItem(US_STOCKS_STORAGE, JSON.stringify(stockState.portfolio));
}

function addStock(symbol, name, shares, avgCost, buyDate) {
  const existing = stockState.portfolio.find(s => s.symbol === symbol.toUpperCase());
  if (existing) {
    // 更新持股
    const totalShares = existing.shares + shares;
    existing.avgCost = ((existing.avgCost * existing.shares) + (avgCost * shares)) / totalShares;
    existing.shares = totalShares;
    if (buyDate && buyDate < existing.buyDate) existing.buyDate = buyDate;
  } else {
    stockState.portfolio.push({
      symbol: symbol.toUpperCase().trim(),
      name: name || symbol.toUpperCase(),
      shares: Number(shares),
      avgCost: Number(avgCost),
      buyDate: buyDate || new Date().toISOString().slice(0, 10),
    });
  }
  savePortfolio();
}

function removeStock(index) {
  stockState.portfolio.splice(index, 1);
  savePortfolio();
}

// ── Yahoo Finance API ──
async function fetchStockPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const result = data?.chart?.result?.[0];
    if (!result) throw new Error('No data');
    const meta = result.meta;
    return {
      symbol: symbol.toUpperCase(),
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose || meta.chartPreviousClose,
      change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose),
      changePercent: ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) / (meta.previousClose || meta.chartPreviousClose || 1)) * 100,
      currency: meta.currency || 'USD',
      name: meta.longName || meta.shortName || symbol,
      updatedAt: Date.now(),
    };
  } catch (e) {
    console.warn(`Failed to fetch ${symbol}:`, e.message);
    return null;
  }
}

async function refreshAllPrices() {
  const symbols = [...new Set(stockState.portfolio.map(s => s.symbol))];
  if (symbols.length === 0) return;

  // Check cache
  const now = Date.now();
  const cacheMs = STOCK_CONFIG.cacheMinutes * 60 * 1000;
  const uncached = symbols.filter(s => {
    const cached = stockState.prices[s];
    return !cached || (now - cached.updatedAt) > cacheMs;
  });

  if (uncached.length === 0) return;

  // Fetch in parallel (batch of 5 to avoid rate limiting)
  const batchSize = 5;
  for (let i = 0; i < uncached.length; i += batchSize) {
    const batch = uncached.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchStockPrice));
    results.forEach(r => {
      if (r) {
        stockState.prices[r.symbol] = r;
        // 更新股票名稱
        const holding = stockState.portfolio.find(h => h.symbol === r.symbol);
        if (holding && r.name && holding.name === holding.symbol) {
          holding.name = r.name;
        }
      }
    });
    if (i + batchSize < uncached.length) {
      await new Promise(r => setTimeout(r, 200)); // rate limit delay
    }
  }
  savePortfolio();
}

// ── Calculate P&L ──
function calcPosition(holding) {
  const price = stockState.prices[holding.symbol];
  const currentPrice = price?.price || 0;
  const marketValue = currentPrice * holding.shares;
  const costBasis = holding.avgCost * holding.shares;
  const pl = marketValue - costBasis;
  const plPercent = costBasis > 0 ? (pl / costBasis) * 100 : 0;
  return { currentPrice, marketValue, costBasis, pl, plPercent, updatedAt: price?.updatedAt || 0 };
}

function calcSummary() {
  let totalCost = 0, totalValue = 0, totalPL = 0;
  stockState.portfolio.forEach(h => {
    const pos = calcPosition(h);
    totalCost += pos.costBasis;
    totalValue += pos.marketValue;
    totalPL += pos.pl;
  });
  return {
    totalCost, totalValue, totalPL,
    plPercent: totalCost > 0 ? (totalPL / totalCost) * 100 : 0,
  };
}

// ── Google Sheets Sync (via Apps Script) ──
async function syncToGoogleSheets() {
  if (!STOCK_CONFIG.gasUrl) {
    alert('尚未設定 Google Sheets 後端。請先部署 Google Apps Script 並填入 URL。');
    return false;
  }
  try {
    const payload = {
      action: 'sync',
      portfolio: stockState.portfolio,
      prices: stockState.prices,
    };
    const resp = await fetch(STOCK_CONFIG.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();
    if (result.success) {
      alert(`已同步至 Google Sheets (${result.rows} 筆)`);
      return true;
    } else {
      alert('同步失敗: ' + (result.error || '未知錯誤'));
      return false;
    }
  } catch (e) {
    alert('同步失敗: ' + e.message);
    return false;
  }
}

async function loadFromGoogleSheets() {
  if (!STOCK_CONFIG.gasUrl) return false;
  try {
    const resp = await fetch(STOCK_CONFIG.gasUrl + '?action=load');
    const result = await resp.json();
    if (result.success && result.portfolio) {
      stockState.portfolio = result.portfolio;
      savePortfolio();
      return true;
    }
    return false;
  } catch { return false; }
}

// ── Render ──
function renderAuthGate() {
  return `
    <div style="max-width:400px;margin:40px auto;text-align:center">
      <div style="font-size:3rem;margin-bottom:16px">📈</div>
      <h3>美股投資組合追蹤</h3>
      <p style="color:var(--muted);margin-bottom:20px">請輸入密碼以查看投資組合</p>
      <div class="input-group">
        <input id="stock-pwd" type="password" placeholder="輸入密碼" style="text-align:center" />
      </div>
      <button class="btn" id="stock-login-btn" style="width:100%;margin-top:12px">解鎖</button>
      <p id="stock-login-error" style="color:#ef4444;font-size:0.85rem;margin-top:8px;display:none">密碼錯誤</p>
    </div>
  `;
}

function renderPortfolio() {
  const summary = calcSummary();
  const plClass = summary.totalPL >= 0 ? 'color:var(--green, #10b981)' : 'color:var(--red, #ef4444)';
  const plSign = summary.totalPL >= 0 ? '+' : '';

  return `
    <div class="us-stocks">
      <!-- 摘要卡片 -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-label">總成本</div>
          <div class="stat-value" style="color:var(--muted)">$${summary.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">目前市值</div>
          <div class="stat-value">$${summary.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">總損益</div>
          <div class="stat-value" style="${plClass}">${plSign}$${summary.totalPL.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">報酬率</div>
          <div class="stat-value" style="${plClass}">${plSign}${summary.plPercent.toFixed(2)}%</div>
        </div>
      </div>

      <!-- 工具列 -->
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
        <button class="btn" onclick="USStocks.showAddForm()">＋ 新增持股</button>
        <button class="btn" id="stock-refresh-btn" onclick="USStocks.refreshPrices()">🔄 更新股價</button>
        ${STOCK_CONFIG.gasUrl ? `
          <button class="btn" onclick="USStocks.syncToSheets()">📤 同步至 Sheets</button>
          <button class="btn" onclick="USStocks.loadFromSheets()">📥 從 Sheets 載入</button>
        ` : ''}
        <span style="font-size:0.75rem;color:var(--muted);margin-left:auto" id="stock-update-time"></span>
      </div>

      <!-- 新增表單 -->
      <div id="stock-add-form" style="display:none;background:var(--card-bg, #f8fafc);border:1px solid var(--glass-border);border-radius:10px;padding:16px;margin-bottom:16px">
        <h4 style="margin-bottom:12px">${stockState.editing !== null ? '編輯持股' : '新增持股'}</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="input-group">
            <label>美股代碼</label>
            <input id="stock-symbol" placeholder="AAPL" style="text-transform:uppercase" />
          </div>
          <div class="input-group">
            <label>股數</label>
            <input id="stock-shares" type="number" step="0.01" min="0" placeholder="10" />
          </div>
          <div class="input-group">
            <label>平均成本 (USD)</label>
            <input id="stock-cost" type="number" step="0.01" min="0" placeholder="150.00" />
          </div>
          <div class="input-group">
            <label>買入日期</label>
            <input id="stock-date" type="date" />
          </div>
        </div>
        <!-- 快速選股 -->
        <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap">
          <span style="font-size:0.75rem;color:var(--muted)">快速選股：</span>
          ${STOCK_CONFIG.popularStocks.map(s => 
            `<span class="stock-chip" onclick="USStocks.quickSelect('${s.symbol}')">${s.symbol}</span>`
          ).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn" onclick="USStocks.saveStock()" style="flex:1">
            ${stockState.editing !== null ? '儲存修改' : '加入投資組合'}
          </button>
          <button class="btn" onclick="USStocks.hideAddForm()" style="background:var(--muted);color:white">取消</button>
        </div>
      </div>

      <!-- 持股表格 -->
      <div class="stock-table-wrap" style="overflow-x:auto">
        <table class="stock-table">
          <thead>
            <tr>
              <th>代碼</th>
              <th>名稱</th>
              <th>股數</th>
              <th>平均成本</th>
              <th>現價</th>
              <th>市值</th>
              <th>損益</th>
              <th>報酬率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="stock-tbody">
            ${stockState.portfolio.length === 0 ? `
              <tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">
                尚無持股，點擊「＋ 新增持股」開始追蹤
              </td></tr>
            ` : stockState.portfolio.map((h, i) => {
              const pos = calcPosition(h);
              const plClass = pos.pl >= 0 ? 'color:var(--green, #10b981)' : 'color:var(--red, #ef4444)';
              const plSign = pos.pl >= 0 ? '+' : '';
              const priceAge = pos.updatedAt ? Math.round((Date.now() - pos.updatedAt) / 60000) : null;
              return `
                <tr>
                  <td><strong>${h.symbol}</strong></td>
                  <td style="font-size:0.85rem;color:var(--muted)">${h.name}</td>
                  <td>${h.shares.toLocaleString()}</td>
                  <td>$${h.avgCost.toFixed(2)}</td>
                  <td>$${pos.currentPrice.toFixed(2)}${priceAge != null ? `<br><span style="font-size:0.7rem;color:var(--muted)">${priceAge}分鐘前</span>` : ''}</td>
                  <td>$${pos.marketValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td style="${plClass}">${plSign}$${pos.pl.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td style="${plClass}">${plSign}${pos.plPercent.toFixed(2)}%</td>
                  <td>
                    <button class="btn-sm" onclick="USStocks.editStock(${i})" title="編輯">✎</button>
                    <button class="btn-sm btn-danger" onclick="USStocks.deleteStock(${i})" title="刪除">✕</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Google Sheets 設定區 -->
      <details style="margin-top:30px;border-top:1px solid var(--glass-border);padding-top:16px">
        <summary style="cursor:pointer;color:var(--muted);font-size:0.85rem">Google Sheets 同步設定</summary>
        <div style="margin-top:12px">
          <div class="input-group">
            <label>Apps Script Web App URL</label>
            <input id="stock-gas-url" value="${STOCK_CONFIG.gasUrl}" placeholder="https://script.google.com/macros/s/..." />
          </div>
          <button class="btn" onclick="USStocks.saveGasUrl()" style="margin-top:8px">儲存設定</button>
          <p style="font-size:0.75rem;color:var(--muted);margin-top:8px">
            部署方式：Google Sheets → 擴充功能 → Apps Script → 貼上後端程式碼 → 部署為網路應用程式
          </p>
        </div>
      </details>
    </div>
  `;
}

// ── 匯出為本模組 ──
const USStocks = {
  init() {
    loadPortfolio();
    const pwdInput = document.getElementById('stock-pwd');
    const loginBtn = document.getElementById('stock-login-btn');
    const errEl = document.getElementById('stock-login-error');

    if (pwdInput && loginBtn) {
      const doLogin = async () => {
        const hash = await sha256(pwdInput.value);
        if (hash === STOCK_CONFIG.passwordHash) {
          stockState.authenticated = true;
          renderStockUI();
        } else {
          errEl.style.display = 'block';
          pwdInput.value = '';
        }
      };
      loginBtn.onclick = doLogin;
      pwdInput.onkeydown = (e) => { if (e.key === 'Enter') doLogin(); };
    }

    // 更新時間戳（清除舊 timer 避免多次導航累積）
    updateTimeDisplay();
    if (_updateTimer) clearInterval(_updateTimer);
    _updateTimer = setInterval(updateTimeDisplay, 30000);
  },

  showAddForm() {
    stockState.editing = null;
    const form = document.getElementById('stock-add-form');
    if (form) {
      form.style.display = 'block';
      document.getElementById('stock-symbol').value = '';
      document.getElementById('stock-shares').value = '';
      document.getElementById('stock-cost').value = '';
      document.getElementById('stock-date').value = new Date().toISOString().slice(0, 10);
    }
  },

  hideAddForm() {
    stockState.editing = null;
    const form = document.getElementById('stock-add-form');
    if (form) form.style.display = 'none';
  },

  editStock(index) {
    const h = stockState.portfolio[index];
    stockState.editing = index;
    const form = document.getElementById('stock-add-form');
    if (form) {
      form.style.display = 'block';
      document.getElementById('stock-symbol').value = h.symbol;
      document.getElementById('stock-shares').value = h.shares;
      document.getElementById('stock-cost').value = h.avgCost;
      document.getElementById('stock-date').value = h.buyDate;
    }
  },

  saveStock() {
    const symbol = document.getElementById('stock-symbol').value.trim().toUpperCase();
    const shares = parseFloat(document.getElementById('stock-shares').value);
    const cost = parseFloat(document.getElementById('stock-cost').value);
    const date = document.getElementById('stock-date').value;

    if (!symbol || isNaN(shares) || shares <= 0 || isNaN(cost) || cost <= 0) {
      alert('請填寫完整的股票代碼、股數和成本');
      return;
    }

    if (stockState.editing !== null) {
      // 編輯模式：先刪除舊的，再加入新的
      removeStock(stockState.editing);
    }

    addStock(symbol, '', shares, cost, date);
    stockState.editing = null;
    renderStockUI();
    refreshAllPrices().then(() => renderStockUI());
  },

  deleteStock(index) {
    if (confirm(`確定要刪除 ${stockState.portfolio[index].symbol} 嗎？`)) {
      removeStock(index);
      renderStockUI();
    }
  },

  quickSelect(symbol) {
    document.getElementById('stock-symbol').value = symbol;
  },

  async refreshPrices() {
    const btn = document.getElementById('stock-refresh-btn');
    if (btn) { btn.disabled = true; btn.textContent = '更新中...'; }
    showToast('正在更新股價...');
    await refreshAllPrices();
    renderStockUI();  // 重新渲染後按鈕自動恢復
    showToast('股價已更新');
  },

  async syncToSheets() {
    await syncToGoogleSheets();
  },

  async loadFromSheets() {
    const ok = await loadFromGoogleSheets();
    if (ok) {
      await refreshAllPrices();
      renderStockUI();
      showToast('已從 Google Sheets 載入');
    } else {
      alert('載入失敗，請確認 Apps Script URL 正確且已部署');
    }
  },

  saveGasUrl() {
    const url = document.getElementById('stock-gas-url').value.trim();
    if (url && !url.startsWith('https://script.google.com/')) {
      alert('GAS URL 必須是 https://script.google.com/ 開頭的網址');
      return;
    }
    STOCK_CONFIG.gasUrl = url;
    url ? localStorage.setItem('dky_us_stocks_gas_url', url)
        : localStorage.removeItem('dky_us_stocks_gas_url');
    renderStockUI();
    showToast('設定已儲存');
  },
};

// ── Render + init ──
function renderStockUI() {
  const container = document.getElementById('stock-container');
  if (!container) return;
  if (!stockState.authenticated) {
    container.innerHTML = renderAuthGate();
    USStocks.init();
  } else {
    container.innerHTML = renderPortfolio();
    USStocks.init();
  }
}

function showToast(msg) {
  const existing = document.querySelector('.stock-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'stock-toast';
  toast.textContent = msg;
  toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 20px;border-radius:20px;font-size:0.85rem;z-index:999;animation:fadeInOut 2s ease';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function updateTimeDisplay() {
  const el = document.getElementById('stock-update-time');
  if (!el) return;
  const prices = Object.values(stockState.prices);
  if (prices.length === 0) { el.textContent = ''; return; }
  const latest = Math.max(...prices.map(p => p.updatedAt));
  const mins = Math.round((Date.now() - latest) / 60000);
  el.textContent = mins === 0 ? '剛剛更新' : `${mins} 分鐘前更新`;
}

// ── 初始化：載入 localStorage 中的 GAS URL ──
const savedGasUrl = localStorage.getItem('dky_us_stocks_gas_url');
if (savedGasUrl) STOCK_CONFIG.gasUrl = savedGasUrl;

// 暴露到全域
window.USStocks = USStocks;

// 提供 render function 給 app.js 的 renderFields
export function render() {
  return `<div id="stock-container"></div>`;
}

export function init() {
  loadPortfolio();
  renderStockUI();
}
