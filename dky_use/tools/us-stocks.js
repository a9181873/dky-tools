/* DKY US Stocks - 美股投資組合追蹤工具
 * 功能：多帳戶、多筆買入 lots、賣出已實現損益、配息、資產配置、CSV、Cloudflare KV 自動雲端同步
 * 股價來源：Cloudflare Pages Function 代理 Yahoo Finance
 */

const STORAGE_VERSION = 2;
const US_STOCKS_STORAGE = 'dky_us_stocks_v2';
const LEGACY_STORAGE = 'dky_us_stocks_v1';

// ── Config ──
const TWD_RATE_STORAGE = 'dky_us_stocks_twd_rate';
const CLOUD_SYNC_URL = '/api/state';
const CLOUD_SYNC_DEBOUNCE_MS = 1500;

const STOCK_CONFIG = {
  cacheMinutes: 5,
  cfProxyUrl: '/api/yahoo-finance',
  popularStocks: [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Alphabet' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'META', name: 'Meta' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
  ],
};

// ── State ──
let stockState = emptyState();
let _updateTimer = null;
let _twdRate = loadTwdRate();

function loadTwdRate() {
  try {
    const saved = localStorage.getItem(TWD_RATE_STORAGE);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { rate: 30.5, updatedAt: 0 };
}

function saveTwdRate(rate) {
  _twdRate = { rate: toNumber(rate, 0), updatedAt: Date.now() };
  localStorage.setItem(TWD_RATE_STORAGE, JSON.stringify(_twdRate));
}

function emptyState() {
  const accounts = ['A', 'B', 'C'].map(name => createAccount(name));
  return {
    version: STORAGE_VERSION,
    activeAccountId: accounts[0].id,
    accounts,
    prices: {},
    form: { type: null, editingId: null, sourceLotId: null },
    filter: '',
    showClosedLots: false,
  };
}

function createAccount(name = '新帳戶') {
  return {
    id: createId('acct'),
    name,
    portfolio: [],
    sales: [],
    dividends: [],
  };
}

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase().replace(/\s+/g, '');
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function roundMoney(value) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

function roundShares(value) {
  return Math.round((toNumber(value) + Number.EPSILON) * 1000000) / 1000000;
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function escapeAttr(value = '') {
  return escapeHTML(value);
}

function formatTWD(usdValue) {
  if (!_twdRate.rate) return '';
  const twd = toNumber(usdValue) * _twdRate.rate;
  return `NT$${Math.round(twd).toLocaleString('en-US')}`;
}

function formatMoney(value, digits = 2) {
  const n = toNumber(value);
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatSignedMoney(value) {
  const n = toNumber(value);
  return `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value, digits = 4) {
  return toNumber(value).toLocaleString('en-US', {
    maximumFractionDigits: digits,
  });
}

function formatPercent(value) {
  const n = toNumber(value);
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

function valueClass(value) {
  return toNumber(value) >= 0 ? 'is-positive' : 'is-negative';
}

// ── Portfolio CRUD / Migration ──
function loadPortfolio() {
  try {
    const raw = localStorage.getItem(US_STOCKS_STORAGE);
    if (raw) {
      stockState = hydrateState(JSON.parse(raw));
      return;
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE);
    if (legacyRaw) {
      const legacyPortfolio = JSON.parse(legacyRaw);
      stockState = migrateLegacyPortfolio(Array.isArray(legacyPortfolio) ? legacyPortfolio : []);
      savePortfolio();
      return;
    }
  } catch (e) {
    console.warn('Failed to load stock state:', e.message);
  }

  stockState = emptyState();
}

function hydrateState(data = {}) {
  const fallback = emptyState();
  const accounts = Array.isArray(data.accounts) && data.accounts.length
    ? data.accounts.map(normalizeAccount)
    : fallback.accounts;

  const activeAccountId = accounts.some(a => a.id === data.activeAccountId)
    ? data.activeAccountId
    : accounts[0].id;

  return {
    version: STORAGE_VERSION,
    activeAccountId,
    accounts,
    prices: normalizePrices(data.prices || {}),
    form: { type: null, editingId: null, sourceLotId: null },
    filter: '',
    showClosedLots: false,
  };
}

function normalizeAccount(account = {}) {
  const id = account.id || createId('acct');
  const name = String(account.name || '新帳戶').trim() || '新帳戶';
  return {
    id,
    name,
    portfolio: Array.isArray(account.portfolio) ? account.portfolio.map(normalizeLot).filter(Boolean) : [],
    sales: Array.isArray(account.sales) ? account.sales.map(normalizeSale).filter(Boolean) : [],
    dividends: Array.isArray(account.dividends) ? account.dividends.map(normalizeDividend).filter(Boolean) : [],
  };
}

function normalizeLot(lot = {}) {
  const symbol = normalizeSymbol(lot.symbol);
  if (!symbol) return null;
  return {
    id: lot.id || createId('lot'),
    symbol,
    name: String(lot.name || symbol).trim() || symbol,
    shares: Math.max(0, toNumber(lot.shares)),
    avgCost: Math.max(0, toNumber(lot.avgCost)),
    twdRate: toNumber(lot.twdRate, 0),
    buyDate: normalizeDate(lot.buyDate || lot.date),
    tag: String(lot.tag || '').trim(),
    note: String(lot.note || '').trim(),
  };
}

function normalizeSale(sale = {}) {
  const symbol = normalizeSymbol(sale.symbol);
  if (!symbol) return null;
  const normalized = {
    id: sale.id || createId('sale'),
    sourceLotId: sale.sourceLotId || '',
    symbol,
    shares: Math.max(0, toNumber(sale.shares)),
    costPerShare: Math.max(0, toNumber(sale.costPerShare || sale.avgCost)),
    sellPrice: Math.max(0, toNumber(sale.sellPrice || sale.price)),
    fee: Math.max(0, toNumber(sale.fee)),
    sellDate: normalizeDate(sale.sellDate || sale.date),
    note: String(sale.note || '').trim(),
  };
  normalized.realizedPL = calcSalePL(normalized);
  return normalized.shares > 0 ? normalized : null;
}

function normalizeDividend(dividend = {}) {
  const symbol = normalizeSymbol(dividend.symbol);
  if (!symbol) return null;
  return {
    id: dividend.id || createId('div'),
    symbol,
    amount: Math.max(0, toNumber(dividend.amount)),
    tax: Math.max(0, toNumber(dividend.tax)),
    payDate: normalizeDate(dividend.payDate || dividend.date),
    note: String(dividend.note || '').trim(),
  };
}

function normalizePrices(prices = {}) {
  return Object.fromEntries(Object.entries(prices)
    .map(([key, price]) => [normalizeSymbol(key), normalizePrice(price)])
    .filter(([key, price]) => key && price));
}

function normalizePrice(price = {}) {
  const symbol = normalizeSymbol(price.symbol);
  const currentPrice = toNumber(price.price, NaN);
  if (!symbol || !Number.isFinite(currentPrice)) return null;
  const previousClose = toNumber(price.previousClose || price.regularMarketPreviousClose || price.chartPreviousClose, currentPrice);
  const change = Number.isFinite(toNumber(price.change, NaN)) ? toNumber(price.change) : currentPrice - previousClose;
  const changePercent = Number.isFinite(toNumber(price.changePercent, NaN))
    ? toNumber(price.changePercent)
    : (previousClose > 0 ? (change / previousClose) * 100 : 0);

  return {
    symbol,
    price: currentPrice,
    previousClose,
    change,
    changePercent,
    currency: price.currency || 'USD',
    name: price.name || price.longName || price.shortName || symbol,
    updatedAt: toNumber(price.updatedAt) || Date.now(),
    source: price.source || 'Yahoo',
  };
}

function migrateLegacyPortfolio(legacyPortfolio) {
  const state = emptyState();
  const account = state.accounts[0];
  account.portfolio = legacyPortfolio.map(normalizeLot).filter(Boolean);
  return state;
}

function savePortfolio() {
  localStorage.setItem(US_STOCKS_STORAGE, JSON.stringify(getPersistableState()));
  scheduleAutoSync();
}

function getPersistableState() {
  return {
    version: STORAGE_VERSION,
    activeAccountId: stockState.activeAccountId,
    accounts: stockState.accounts,
    prices: stockState.prices,
  };
}

function getActiveAccount() {
  if (!stockState.accounts.length) {
    stockState.accounts = emptyState().accounts;
    stockState.activeAccountId = stockState.accounts[0].id;
  }

  let account = stockState.accounts.find(a => a.id === stockState.activeAccountId);
  if (!account) {
    account = stockState.accounts[0];
    stockState.activeAccountId = account.id;
  }
  return account;
}

function setActiveAccount(accountId) {
  if (stockState.accounts.some(a => a.id === accountId)) {
    stockState.activeAccountId = accountId;
    stockState.form = { type: null, editingId: null, sourceLotId: null };
    savePortfolio();
  }
}

// ── Price API (Cloudflare Pages Function proxy → Yahoo Finance) ──
async function fetchPricesViaCfProxy(symbols) {
  if (symbols.length === 0) return {};
  const url = `${STOCK_CONFIG.cfProxyUrl}?action=quote&symbols=${encodeURIComponent(symbols.join(','))}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`CF Proxy HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data.success) throw new Error(data.error || 'CF proxy failed');
  return normalizePrices(data.prices || {});
}

async function fetchStockPrices(symbols) {
  const uniqueSymbols = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))];
  try {
    return await fetchPricesViaCfProxy(uniqueSymbols);
  } catch (e) {
    console.warn('CF Proxy failed:', e.message);
    return {};
  }
}



function getTrackedSymbols() {
  const account = getActiveAccount();
  return [...new Set([
    ...account.portfolio.map(lot => lot.symbol),
    ...account.sales.map(sale => sale.symbol),
    ...account.dividends.map(dividend => dividend.symbol),
  ].map(normalizeSymbol).filter(Boolean))];
}

async function refreshAllPrices(options = {}) {
  const { force = false } = options;
  const symbols = getTrackedSymbols();
  if (symbols.length === 0) return { updated: 0, failed: [] };

  const now = Date.now();
  const cacheMs = STOCK_CONFIG.cacheMinutes * 60 * 1000;
  const targets = force ? symbols : symbols.filter(symbol => {
    const cached = stockState.prices[symbol];
    return !cached || (now - cached.updatedAt) > cacheMs;
  });

  if (targets.length === 0) return { updated: 0, failed: [] };

  const freshPrices = await fetchStockPrices(targets);
  Object.entries(freshPrices).forEach(([symbol, price]) => {
    stockState.prices[symbol] = price;
    updateLotNamesFromPrice(symbol, price);
  });

  savePortfolio();
  return {
    updated: Object.keys(freshPrices).length,
    failed: targets.filter(symbol => !freshPrices[symbol]),
  };
}

function updateLotNamesFromPrice(symbol, price) {
  const name = price?.name;
  if (!name) return;
  stockState.accounts.forEach(account => {
    account.portfolio.forEach(lot => {
      if (lot.symbol === symbol && (!lot.name || lot.name === symbol)) lot.name = name;
    });
  });
}

// ── Calculate P&L ──
function calcLotPosition(lot) {
  const price = stockState.prices[lot.symbol];
  const currentPrice = price?.price || 0;
  const shares = toNumber(lot.shares);
  const marketValue = currentPrice * shares;
  const costBasis = toNumber(lot.avgCost) * shares;
  const pl = marketValue - costBasis;
  const plPercent = costBasis > 0 ? (pl / costBasis) * 100 : 0;
  return {
    currentPrice,
    marketValue,
    costBasis,
    pl,
    plPercent,
    updatedAt: price?.updatedAt || 0,
  };
}

function calcSalePL(sale) {
  const proceeds = toNumber(sale.sellPrice) * toNumber(sale.shares);
  const costBasis = toNumber(sale.costPerShare) * toNumber(sale.shares);
  return roundMoney(proceeds - costBasis - toNumber(sale.fee));
}

function calcDividendNet(dividend) {
  return roundMoney(toNumber(dividend.amount) - toNumber(dividend.tax));
}

function calcSymbolRows(account = getActiveAccount()) {
  const grouped = new Map();

  account.portfolio
    .filter(lot => lot.shares > 0)
    .forEach(lot => {
      if (!grouped.has(lot.symbol)) {
        grouped.set(lot.symbol, {
          symbol: lot.symbol,
          name: lot.name || lot.symbol,
          shares: 0,
          costBasis: 0,
          marketValue: 0,
          currentPrice: stockState.prices[lot.symbol]?.price || 0,
          updatedAt: stockState.prices[lot.symbol]?.updatedAt || 0,
        });
      }
      const row = grouped.get(lot.symbol);
      const pos = calcLotPosition(lot);
      row.shares += lot.shares;
      row.costBasis += pos.costBasis;
      row.marketValue += pos.marketValue;
      if ((!row.name || row.name === row.symbol) && lot.name) row.name = lot.name;
    });

  return [...grouped.values()].map(row => {
    const unrealizedPL = row.marketValue - row.costBasis;
    return {
      ...row,
      avgCost: row.shares > 0 ? row.costBasis / row.shares : 0,
      unrealizedPL,
      unrealizedPercent: row.costBasis > 0 ? (unrealizedPL / row.costBasis) * 100 : 0,
    };
  }).sort((a, b) => b.marketValue - a.marketValue);
}

function calcSummary(account = getActiveAccount()) {
  const lots = account.portfolio.filter(lot => lot.shares > 0);
  const totalCost = lots.reduce((sum, lot) => sum + calcLotPosition(lot).costBasis, 0);
  const totalValue = lots.reduce((sum, lot) => sum + calcLotPosition(lot).marketValue, 0);
  const unrealizedPL = totalValue - totalCost;
  const realizedPL = account.sales.reduce((sum, sale) => sum + calcSalePL(sale), 0);
  const realizedCostBasis = account.sales.reduce((sum, sale) => sum + (toNumber(sale.costPerShare) * toNumber(sale.shares)), 0);
  const dividendIncome = account.dividends.reduce((sum, dividend) => sum + calcDividendNet(dividend), 0);
  const totalReturn = unrealizedPL + realizedPL + dividendIncome;
  const totalReturnBase = totalCost + realizedCostBasis;
  const allocation = calcSymbolRows(account);

  return {
    totalCost,
    totalValue,
    unrealizedPL,
    unrealizedPercent: totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0,
    realizedPL,
    dividendIncome,
    totalReturn,
    totalReturnPercent: totalReturnBase > 0 ? (totalReturn / totalReturnBase) * 100 : 0,
    positions: allocation.length,
    lots: account.portfolio.length,
    closedLots: account.portfolio.filter(lot => lot.shares <= 0).length,
    sales: account.sales.length,
    dividends: account.dividends.length,
  };
}

function calcAllocationRows(account = getActiveAccount()) {
  const rows = calcSymbolRows(account);
  const totalValue = rows.reduce((sum, row) => sum + row.marketValue, 0);
  return rows.map(row => ({
    ...row,
    weight: totalValue > 0 ? (row.marketValue / totalValue) * 100 : 0,
  }));
}

// ── Cloud Sync (Cloudflare KV via /api/state) ──
let _cloudSyncTimer = null;
let _cloudSyncInFlight = false;
let _cloudSyncStatus = 'idle'; // 'idle' | 'syncing' | 'ok' | 'offline'
let _cloudSyncSuppressed = false;

function getAuthToken() {
  return (typeof window !== 'undefined' && window.__AUTH_TOKEN) || '';
}

function setSyncStatus(status) {
  _cloudSyncStatus = status;
  const el = document.getElementById('stock-sync-status');
  if (!el) return;
  const label = {
    syncing: '⏳ 同步中',
    ok: '☁️ 已同步',
    offline: '⚠️ 離線（資料僅本機）',
    idle: '',
  }[status] || '';
  el.textContent = label;
  el.dataset.status = status;
}

async function pushStateToCloud() {
  const token = getAuthToken();
  if (!token) return false;
  if (_cloudSyncInFlight) {
    scheduleAutoSync();
    return false;
  }
  _cloudSyncInFlight = true;
  setSyncStatus('syncing');
  try {
    const resp = await fetch(CLOUD_SYNC_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        state: getPersistableState(),
        updatedAt: Date.now(),
      }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.success) throw new Error(data.error || 'sync failed');
    setSyncStatus('ok');
    return true;
  } catch (e) {
    console.warn('Cloud sync push failed:', e.message);
    setSyncStatus('offline');
    return false;
  } finally {
    _cloudSyncInFlight = false;
  }
}

async function pullStateFromCloud() {
  const token = getAuthToken();
  if (!token) return { ok: false, hasRemote: false };
  setSyncStatus('syncing');
  try {
    const resp = await fetch(CLOUD_SYNC_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.success) throw new Error(data.error || 'load failed');
    if (data.state) {
      _cloudSyncSuppressed = true;
      stockState = hydrateState(data.state);
      localStorage.setItem(US_STOCKS_STORAGE, JSON.stringify(getPersistableState()));
      _cloudSyncSuppressed = false;
      setSyncStatus('ok');
      return { ok: true, hasRemote: true };
    }
    setSyncStatus('ok');
    return { ok: true, hasRemote: false };
  } catch (e) {
    console.warn('Cloud sync pull failed:', e.message);
    setSyncStatus('offline');
    return { ok: false, hasRemote: false };
  }
}

function scheduleAutoSync() {
  if (_cloudSyncSuppressed) return;
  if (!getAuthToken()) return;
  if (_cloudSyncTimer) clearTimeout(_cloudSyncTimer);
  _cloudSyncTimer = setTimeout(() => {
    _cloudSyncTimer = null;
    pushStateToCloud();
  }, CLOUD_SYNC_DEBOUNCE_MS);
}

// ── Rendering helpers ──
function matchesFilter(...values) {
  const query = stockState.filter.trim().toLowerCase();
  if (!query) return true;
  return values.some(value => String(value || '').toLowerCase().includes(query));
}

function renderAccountTabs() {
  const active = getActiveAccount();
  return `
    <div class="stock-account-bar">
      <div class="stock-account-tabs" role="tablist" aria-label="投資帳戶">
        ${stockState.accounts.map(account => `
          <button class="stock-account-tab${account.id === active.id ? ' active' : ''}" onclick="USStocks.switchAccount('${account.id}')">
            ${escapeHTML(account.name)}
          </button>
        `).join('')}
      </div>
      <div class="stock-account-actions">
        <button class="btn-sm" onclick="USStocks.addAccount()">新增帳戶</button>
        <button class="btn-sm" onclick="USStocks.renameAccount()">重新命名</button>
        <button class="btn-sm btn-danger" onclick="USStocks.deleteAccount()">刪除帳戶</button>
      </div>
    </div>
  `;
}

function renderSummary() {
  const summary = calcSummary();
  const twdRef = (usd) => _twdRate.rate > 0 ? `<span class="stat-twd">${formatTWD(usd)}</span>` : '';
  const stat = (label, value, extraClass = '', sub = '') => `
    <div class="stat-card stock-stat">
      <div class="stat-label">${label}</div>
      <div class="stat-value ${extraClass}">${value}</div>
      ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
    </div>
  `;

  return `
    <div class="stock-summary-grid">
      ${stat('目前成本', formatMoney(summary.totalCost), '', `${summary.lots} 筆買入 / ${summary.positions} 檔持股${twdRef(summary.totalCost)}`)}
      ${stat('目前市值', formatMoney(summary.totalValue), '', twdRef(summary.totalValue))}
      ${stat('未實現損益', formatSignedMoney(summary.unrealizedPL), valueClass(summary.unrealizedPL), `${formatPercent(summary.unrealizedPercent)}${twdRef(summary.unrealizedPL)}`)}
      ${stat('已實現損益', formatSignedMoney(summary.realizedPL), valueClass(summary.realizedPL), `${summary.sales} 筆賣出${twdRef(summary.realizedPL)}`)}
      ${stat('配息收入', formatMoney(summary.dividendIncome), 'is-income', `${summary.dividends} 筆收入${twdRef(summary.dividendIncome)}`)}
      ${stat('總報酬', formatSignedMoney(summary.totalReturn), valueClass(summary.totalReturn), `${formatPercent(summary.totalReturnPercent)}${twdRef(summary.totalReturn)}`)}
    </div>
  `;
}

function renderToolbar() {
  return `
    <div class="stock-toolbar">
      <div class="stock-toolbar-main">
        <button class="btn" onclick="USStocks.showBuyForm()">新增買入</button>
        <button class="btn" onclick="USStocks.showSellForm()">登記賣出</button>
        <button class="btn" onclick="USStocks.showDividendForm()">登記配息</button>
        <button class="btn" id="stock-refresh-btn" onclick="USStocks.refreshPrices()">更新股價</button>
      </div>
      <div class="stock-toolbar-secondary">
        <input class="stock-search" id="stock-filter" value="${escapeAttr(stockState.filter)}" oninput="USStocks.setFilter(this.value)" placeholder="搜尋代碼 / 名稱 / 標籤" />
        <div class="stock-twd-input">
          <label>台幣匯率</label>
          <input id="stock-twd-rate" type="number" step="0.01" min="0" value="${_twdRate.rate || ''}" placeholder="30.50" onchange="USStocks.saveTwdRate(this.value)" />
        </div>
        <button class="btn-sm" onclick="USStocks.exportCsv()">匯出 CSV</button>
        <button class="btn-sm" onclick="document.getElementById('stock-import-file').click()">匯入 CSV</button>
        <input id="stock-import-file" type="file" accept=".csv,text/csv" style="display:none" onchange="USStocks.importCsv(event)" />
      </div>
      <span class="stock-update-time" id="stock-update-time"></span>
      <span class="stock-sync-status" id="stock-sync-status" data-status="idle"></span>
    </div>
  `;
}

function renderForm() {
  if (stockState.form.type === 'buy') return renderBuyForm();
  if (stockState.form.type === 'sell') return renderSellForm();
  if (stockState.form.type === 'dividend') return renderDividendForm();
  if (stockState.form.type === 'account') return renderAccountForm();
  return '';
}

function renderAccountForm() {
  const isEditing = stockState.form.editingId === 'rename';
  const account = getActiveAccount();
  const defaultName = isEditing ? account.name : `帳戶 ${stockState.accounts.length + 1}`;

  return `
    <section class="stock-form-panel" style="max-width: 400px; margin: 0 auto;">
      <div class="stock-form-head">
        <h3>${isEditing ? '重新命名帳戶' : '新增帳戶'}</h3>
        <button class="btn-sm" onclick="USStocks.hideForm()">關閉</button>
      </div>
      <div class="stock-form-grid" style="grid-template-columns: 1fr;">
        <div class="input-group">
          <label>帳戶名稱</label>
          <input id="stock-account-name" value="${escapeAttr(defaultName)}" placeholder="請輸入帳戶名稱" />
        </div>
      </div>
      <div class="stock-form-actions">
        <button class="btn" onclick="USStocks.saveAccount()">${isEditing ? '儲存' : '新增'}</button>
        <button class="btn btn-muted" onclick="USStocks.hideForm()">取消</button>
      </div>
    </section>
  `;
}

function renderBuyForm() {
  const account = getActiveAccount();
  const editingLot = stockState.form.editingId
    ? account.portfolio.find(lot => lot.id === stockState.form.editingId)
    : null;
  const isEditing = Boolean(editingLot);

  return `
    <section class="stock-form-panel">
      <div class="stock-form-head">
        <h3>${isEditing ? '編輯買入紀錄' : '新增買入紀錄'}</h3>
        <button class="btn-sm" onclick="USStocks.hideForm()">關閉</button>
      </div>
      <div class="stock-form-grid">
        <div class="input-group">
          <label>美股代碼</label>
          <input id="stock-symbol" placeholder="AAPL" value="${escapeAttr(editingLot?.symbol || '')}" style="text-transform:uppercase" />
        </div>
        <div class="input-group">
          <label>股票名稱</label>
          <input id="stock-name" placeholder="可留空，更新股價後自動補上" value="${escapeAttr(editingLot?.name || '')}" />
        </div>
        <div class="input-group">
          <label>股數</label>
          <input id="stock-shares" type="number" step="0.0001" min="0" placeholder="10" value="${editingLot ? escapeAttr(editingLot.shares) : ''}" />
        </div>
        <div class="input-group">
          <label>成本 / 股 (USD)</label>
          <input id="stock-cost" type="number" step="0.01" min="0" placeholder="150.00" value="${editingLot ? escapeAttr(editingLot.avgCost) : ''}" />
        </div>
        <div class="input-group">
          <label>買入日期</label>
          <input id="stock-date" type="date" value="${escapeAttr(editingLot?.buyDate || new Date().toISOString().slice(0, 10))}" />
        </div>
        <div class="input-group">
          <label>標籤 / 場景</label>
          <input id="stock-tag" placeholder="長期、短線、退休金..." value="${escapeAttr(editingLot?.tag || '')}" />
        </div>
        <div class="input-group">
          <label>台幣匯率 (TWD/USD)</label>
          <input id="stock-twd" type="number" step="0.01" min="0" placeholder="${_twdRate.rate || '30.50'}" value="${editingLot?.twdRate || escapeAttr(_twdRate.rate || '')}" />
        </div>
        <div class="input-group stock-form-wide">
          <label>備註</label>
          <input id="stock-note" placeholder="買入原因、券商、策略..." value="${escapeAttr(editingLot?.note || '')}" />
        </div>
      </div>
      <div class="stock-quick-row">
        <span>快速選股</span>
        ${STOCK_CONFIG.popularStocks.map(stock => `
          <button class="stock-chip" onclick="USStocks.quickSelect('${stock.symbol}')">${stock.symbol}</button>
        `).join('')}
      </div>
      <div class="stock-form-actions">
        <button class="btn" onclick="USStocks.saveBuy()">${isEditing ? '儲存修改' : '加入投資組合'}</button>
        <button class="btn btn-muted" onclick="USStocks.hideForm()">取消</button>
      </div>
    </section>
  `;
}

function renderSellForm() {
  const account = getActiveAccount();
  const editingSale = stockState.form.editingId
    ? account.sales.find(sale => sale.id === stockState.form.editingId)
    : null;
  const selectedLot = account.portfolio.find(lot => lot.id === (editingSale?.sourceLotId || stockState.form.sourceLotId));
  const currentSymbol = editingSale?.symbol || selectedLot?.symbol || '';
  const currentPrice = stockState.prices[currentSymbol]?.price || '';
  const costPerShare = editingSale?.costPerShare ?? selectedLot?.avgCost ?? '';

  return `
    <section class="stock-form-panel">
      <div class="stock-form-head">
        <h3>${editingSale ? '編輯賣出紀錄' : '登記賣出紀錄'}</h3>
        <button class="btn-sm" onclick="USStocks.hideForm()">關閉</button>
      </div>
      <div class="stock-form-grid">
        <div class="input-group stock-form-wide">
          <label>來源持股</label>
          <select id="stock-sale-lot" onchange="USStocks.selectSaleLot()">
            <option value="">不指定來源，手動輸入成本</option>
            ${account.portfolio.filter(lot => lot.shares > 0 || lot.id === editingSale?.sourceLotId).map(lot => {
              const selected = lot.id === (editingSale?.sourceLotId || stockState.form.sourceLotId) ? ' selected' : '';
              return `<option value="${escapeAttr(lot.id)}"${selected}>${escapeHTML(lot.symbol)} · ${formatNumber(lot.shares)} 股 · 成本 ${formatMoney(lot.avgCost)}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="input-group">
          <label>美股代碼</label>
          <input id="stock-sale-symbol" placeholder="AAPL" value="${escapeAttr(currentSymbol)}" style="text-transform:uppercase" />
        </div>
        <div class="input-group">
          <label>賣出股數</label>
          <input id="stock-sale-shares" type="number" step="0.0001" min="0" placeholder="5" value="${editingSale ? escapeAttr(editingSale.shares) : ''}" />
        </div>
        <div class="input-group">
          <label>成本 / 股 (可調整)</label>
          <input id="stock-sale-cost" type="number" step="0.01" min="0" placeholder="150.00" value="${escapeAttr(costPerShare)}" />
        </div>
        <div class="input-group">
          <label>賣價 / 股 (可調整)</label>
          <input id="stock-sale-price" type="number" step="0.01" min="0" placeholder="180.00" value="${editingSale ? escapeAttr(editingSale.sellPrice) : escapeAttr(currentPrice)}" />
        </div>
        <div class="input-group">
          <label>手續費 / 稅費</label>
          <input id="stock-sale-fee" type="number" step="0.01" min="0" placeholder="0" value="${editingSale ? escapeAttr(editingSale.fee) : ''}" />
        </div>
        <div class="input-group">
          <label>賣出日期</label>
          <input id="stock-sale-date" type="date" value="${escapeAttr(editingSale?.sellDate || new Date().toISOString().slice(0, 10))}" />
        </div>
        <div class="input-group stock-form-wide">
          <label>備註</label>
          <input id="stock-sale-note" placeholder="停利、停損、換股..." value="${escapeAttr(editingSale?.note || '')}" />
        </div>
      </div>
      <div class="stock-form-actions">
        <button class="btn" onclick="USStocks.saveSale()">${editingSale ? '儲存修改' : '記錄賣出'}</button>
        <button class="btn btn-muted" onclick="USStocks.hideForm()">取消</button>
      </div>
    </section>
  `;
}

function renderDividendForm() {
  const account = getActiveAccount();
  const editingDividend = stockState.form.editingId
    ? account.dividends.find(dividend => dividend.id === stockState.form.editingId)
    : null;

  return `
    <section class="stock-form-panel">
      <div class="stock-form-head">
        <h3>${editingDividend ? '編輯配息紀錄' : '登記配息 / 收入'}</h3>
        <button class="btn-sm" onclick="USStocks.hideForm()">關閉</button>
      </div>
      <div class="stock-form-grid">
        <div class="input-group">
          <label>美股代碼</label>
          <input id="stock-div-symbol" placeholder="AAPL" value="${escapeAttr(editingDividend?.symbol || '')}" style="text-transform:uppercase" />
        </div>
        <div class="input-group">
          <label>配息總額 (USD)</label>
          <input id="stock-div-amount" type="number" step="0.01" min="0" placeholder="25.00" value="${editingDividend ? escapeAttr(editingDividend.amount) : ''}" />
        </div>
        <div class="input-group">
          <label>預扣稅 / 費用</label>
          <input id="stock-div-tax" type="number" step="0.01" min="0" placeholder="0" value="${editingDividend ? escapeAttr(editingDividend.tax) : ''}" />
        </div>
        <div class="input-group">
          <label>入帳日期</label>
          <input id="stock-div-date" type="date" value="${escapeAttr(editingDividend?.payDate || new Date().toISOString().slice(0, 10))}" />
        </div>
        <div class="input-group stock-form-wide">
          <label>備註</label>
          <input id="stock-div-note" placeholder="股息、利息、其他收入..." value="${escapeAttr(editingDividend?.note || '')}" />
        </div>
      </div>
      <div class="stock-form-actions">
        <button class="btn" onclick="USStocks.saveDividend()">${editingDividend ? '儲存修改' : '記錄收入'}</button>
        <button class="btn btn-muted" onclick="USStocks.hideForm()">取消</button>
      </div>
    </section>
  `;
}

function renderHoldingsTable() {
  const account = getActiveAccount();
  const rows = calcSymbolRows(account)
    .filter(row => matchesFilter(row.symbol, row.name));

  return `
    <section class="stock-section">
      <div class="stock-section-head">
        <h3>持股總覽</h3>
        <span>${rows.length} 檔</span>
      </div>
      <div class="stock-table-wrap">
        <table class="stock-table">
          <thead>
            <tr>
              <th>代碼</th>
              <th>股數</th>
              <th>平均成本</th>
              <th>現價</th>
              <th>市值</th>
              <th>未實現</th>
              <th>報酬率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0 ? `
              <tr><td colspan="8" class="stock-empty">目前沒有符合條件的持股</td></tr>
            ` : rows.map(row => {
              const age = row.updatedAt ? Math.round((Date.now() - row.updatedAt) / 60000) : null;
              return `
                <tr>
                  <td>
                    <strong>${escapeHTML(row.symbol)}</strong>
                    <span class="stock-name">${escapeHTML(row.name)}</span>
                  </td>
                  <td>${formatNumber(row.shares)}</td>
                  <td>${formatMoney(row.avgCost)}</td>
                  <td>
                    ${row.currentPrice ? formatMoney(row.currentPrice) : '<span class="stock-muted">待更新</span>'}
                    ${age != null ? `<span class="stock-price-age">${age <= 0 ? '剛剛' : `${age} 分鐘前`}</span>` : ''}
                  </td>
                  <td>${formatMoney(row.marketValue)}</td>
                  <td class="${valueClass(row.unrealizedPL)}">${formatSignedMoney(row.unrealizedPL)}</td>
                  <td class="${valueClass(row.unrealizedPercent)}">${formatPercent(row.unrealizedPercent)}</td>
                  <td><button class="btn-sm" onclick="USStocks.showSellFormBySymbol('${escapeAttr(row.symbol)}')">賣出</button></td>
                </tr>
              `;
            }).join('')}
            ${rows.length > 0 ? (() => {
              const totals = rows.reduce((acc, r) => {
                acc.costBasis += r.costBasis;
                acc.marketValue += r.marketValue;
                acc.unrealizedPL += r.unrealizedPL;
                return acc;
              }, { costBasis: 0, marketValue: 0, unrealizedPL: 0 });
              const totalPercent = totals.costBasis > 0 ? (totals.unrealizedPL / totals.costBasis) * 100 : 0;
              const twdCost = _twdRate.rate > 0 ? `<span class="stock-twd-ref">${formatTWD(totals.costBasis)}</span>` : '';
              const twdValue = _twdRate.rate > 0 ? `<span class="stock-twd-ref">${formatTWD(totals.marketValue)}</span>` : '';
              const twdPL = _twdRate.rate > 0 ? `<span class="stock-twd-ref">${formatTWD(totals.unrealizedPL)}</span>` : '';
              return `
                <tr class="stock-totals-row">
                  <td><strong>合計</strong></td>
                  <td></td>
                  <td>${formatMoney(totals.costBasis)}${twdCost}</td>
                  <td></td>
                  <td>${formatMoney(totals.marketValue)}${twdValue}</td>
                  <td class="${valueClass(totals.unrealizedPL)}">${formatSignedMoney(totals.unrealizedPL)}${twdPL}</td>
                  <td class="${valueClass(totalPercent)}">${formatPercent(totalPercent)}</td>
                  <td></td>
                </tr>
              `;
            })() : ''}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderLotsTable() {
  const account = getActiveAccount();
  const lots = account.portfolio
    .filter(lot => stockState.showClosedLots || lot.shares > 0)
    .filter(lot => matchesFilter(lot.symbol, lot.name, lot.tag, lot.note))
    .sort((a, b) => String(b.buyDate).localeCompare(String(a.buyDate)));

  return `
    <section class="stock-section">
      <div class="stock-section-head">
        <h3>買入批號</h3>
        <button class="btn-sm" onclick="USStocks.toggleClosedLots()">
          ${stockState.showClosedLots ? '隱藏已結清' : '顯示已結清'}
        </button>
      </div>
      <div class="stock-table-wrap">
        <table class="stock-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>代碼</th>
              <th>股數</th>
              <th>成本 / 股</th>
              <th>成本總額</th>
              <th>匯率</th>
              <th>台幣成本</th>
              <th>標籤</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${lots.length === 0 ? `
              <tr><td colspan="9" class="stock-empty">尚無買入紀錄</td></tr>
            ` : lots.map(lot => {
              const costBasis = lot.shares * lot.avgCost;
              const twdCost = lot.twdRate > 0 ? costBasis * lot.twdRate : 0;
              return `
                <tr class="${lot.shares <= 0 ? 'stock-row-muted' : ''}">
                  <td>${escapeHTML(lot.buyDate)}</td>
                  <td>
                    <strong>${escapeHTML(lot.symbol)}</strong>
                    <span class="stock-name">${escapeHTML(lot.name)}</span>
                  </td>
                  <td>${formatNumber(lot.shares)}${lot.shares <= 0 ? '<span class="stock-badge">已結清</span>' : ''}</td>
                  <td>${formatMoney(lot.avgCost)}</td>
                  <td>${formatMoney(costBasis)}</td>
                  <td>${lot.twdRate > 0 ? lot.twdRate.toFixed(2) : '<span class="stock-muted">-</span>'}</td>
                  <td>${twdCost > 0 ? `NT$${Math.round(twdCost).toLocaleString('en-US')}` : '<span class="stock-muted">-</span>'}</td>
                  <td>${lot.tag ? `<span class="stock-tag">${escapeHTML(lot.tag)}</span>` : '<span class="stock-muted">-</span>'}</td>
                  <td class="stock-actions">
                    <button class="btn-sm" onclick="USStocks.editBuy('${escapeAttr(lot.id)}')">編輯</button>
                    ${lot.shares > 0 ? `<button class="btn-sm" onclick="USStocks.showSellForm('${escapeAttr(lot.id)}')">賣出</button>` : ''}
                    <button class="btn-sm btn-danger" onclick="USStocks.deleteBuy('${escapeAttr(lot.id)}')">刪除</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSalesTable() {
  const account = getActiveAccount();
  const sales = account.sales
    .filter(sale => matchesFilter(sale.symbol, sale.note))
    .sort((a, b) => String(b.sellDate).localeCompare(String(a.sellDate)));

  return `
    <section class="stock-section">
      <div class="stock-section-head">
        <h3>賣出與已實現損益</h3>
        <span>${sales.length} 筆</span>
      </div>
      <div class="stock-table-wrap">
        <table class="stock-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>代碼</th>
              <th>股數</th>
              <th>成本 / 股</th>
              <th>賣價 / 股</th>
              <th>費用</th>
              <th>已實現</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${sales.length === 0 ? `
              <tr><td colspan="8" class="stock-empty">尚無賣出紀錄</td></tr>
            ` : sales.map(sale => {
              const pl = calcSalePL(sale);
              return `
                <tr>
                  <td>${escapeHTML(sale.sellDate)}</td>
                  <td><strong>${escapeHTML(sale.symbol)}</strong>${sale.note ? `<span class="stock-name">${escapeHTML(sale.note)}</span>` : ''}</td>
                  <td>${formatNumber(sale.shares)}</td>
                  <td>${formatMoney(sale.costPerShare)}</td>
                  <td>${formatMoney(sale.sellPrice)}</td>
                  <td>${formatMoney(sale.fee)}</td>
                  <td class="${valueClass(pl)}">${formatSignedMoney(pl)}</td>
                  <td class="stock-actions">
                    <button class="btn-sm" onclick="USStocks.editSale('${escapeAttr(sale.id)}')">編輯</button>
                    <button class="btn-sm btn-danger" onclick="USStocks.deleteSale('${escapeAttr(sale.id)}')">刪除</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDividendsTable() {
  const account = getActiveAccount();
  const dividends = account.dividends
    .filter(dividend => matchesFilter(dividend.symbol, dividend.note))
    .sort((a, b) => String(b.payDate).localeCompare(String(a.payDate)));

  return `
    <section class="stock-section">
      <div class="stock-section-head">
        <h3>配息 / 收入</h3>
        <span>${dividends.length} 筆</span>
      </div>
      <div class="stock-table-wrap">
        <table class="stock-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>代碼</th>
              <th>總額</th>
              <th>稅費</th>
              <th>淨收入</th>
              <th>備註</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${dividends.length === 0 ? `
              <tr><td colspan="7" class="stock-empty">尚無配息或收入紀錄</td></tr>
            ` : dividends.map(dividend => `
              <tr>
                <td>${escapeHTML(dividend.payDate)}</td>
                <td><strong>${escapeHTML(dividend.symbol)}</strong></td>
                <td>${formatMoney(dividend.amount)}</td>
                <td>${formatMoney(dividend.tax)}</td>
                <td class="is-income">${formatMoney(calcDividendNet(dividend))}</td>
                <td>${dividend.note ? escapeHTML(dividend.note) : '<span class="stock-muted">-</span>'}</td>
                <td class="stock-actions">
                  <button class="btn-sm" onclick="USStocks.editDividend('${escapeAttr(dividend.id)}')">編輯</button>
                  <button class="btn-sm btn-danger" onclick="USStocks.deleteDividend('${escapeAttr(dividend.id)}')">刪除</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAllocation() {
  const rows = calcAllocationRows().filter(row => matchesFilter(row.symbol, row.name));
  const topWeight = rows[0]?.weight || 0;

  return `
    <details class="stock-section stock-settings stock-allocation">
      <summary style="display:flex; justify-content:space-between; align-items:center; font-weight:600;">
        <span style="font-size: 0.98rem; color:var(--stock-text);">資產配置</span>
        <span style="font-size: 0.76rem; font-weight:normal; color:var(--stock-muted)">點擊展開 · ${topWeight >= 50 ? '集中度偏高' : '配置正常'}</span>
      </summary>
      <div class="stock-settings-body" style="padding-top: 4px;">
      ${rows.length === 0 ? `<div class="stock-empty" style="padding:16px 12px;">尚無可計算的資產配置</div>` : `
        <div class="allocation-list" style="padding: 0;">
          ${rows.map(row => `
            <div class="allocation-row" style="margin-bottom:12px;">
              <div class="allocation-meta">
                <strong>${escapeHTML(row.symbol)}</strong>
                <span>${formatMoney(row.marketValue)} · ${row.weight.toFixed(1)}%</span>
              </div>
              <div class="allocation-track">
                <div class="allocation-fill" style="width:${Math.min(100, row.weight).toFixed(2)}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
      </div>
    </details>
  `;
}

function renderPortfolio() {
  return `
    <div class="us-stocks">
      ${renderAccountTabs()}
      ${renderSummary()}
      ${renderToolbar()}
      ${renderForm()}
      <div class="stock-layout">
        <div class="stock-main-column">
          ${renderHoldingsTable()}
          ${renderLotsTable()}
          ${renderSalesTable()}
          ${renderDividendsTable()}
        </div>
        <aside class="stock-side-column">
          ${renderAllocation()}
        </aside>
      </div>
    </div>
  `;
}

// ── Form actions ──
function setForm(type, editingId = null, sourceLotId = null) {
  stockState.form = { type, editingId, sourceLotId };
  renderStockUI();
}

function getInputValue(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function addOrUpdateLot(lot) {
  const account = getActiveAccount();
  const existingIndex = account.portfolio.findIndex(item => item.id === lot.id);
  if (existingIndex >= 0) account.portfolio[existingIndex] = lot;
  else account.portfolio.push(lot);
}

function restoreSaleToLot(account, sale) {
  if (!sale?.sourceLotId) return;
  const lot = account.portfolio.find(item => item.id === sale.sourceLotId);
  if (lot) lot.shares = roundShares(toNumber(lot.shares) + toNumber(sale.shares));
}

function availableSharesForLot(account, lotId, editingSale = null) {
  const lot = account.portfolio.find(item => item.id === lotId);
  if (!lot) return 0;
  return toNumber(lot.shares) + (editingSale?.sourceLotId === lotId ? toNumber(editingSale.shares) : 0);
}

function reduceLotForSale(account, lotId, shares) {
  if (!lotId) return;
  const lot = account.portfolio.find(item => item.id === lotId);
  if (lot) lot.shares = Math.max(0, roundShares(toNumber(lot.shares) - toNumber(shares)));
}

function getSaleFormData() {
  const sourceLotId = getInputValue('stock-sale-lot');
  const symbol = normalizeSymbol(getInputValue('stock-sale-symbol'));
  const shares = toNumber(getInputValue('stock-sale-shares'), NaN);
  const costPerShare = toNumber(getInputValue('stock-sale-cost'), NaN);
  const sellPrice = toNumber(getInputValue('stock-sale-price'), NaN);
  const fee = Math.max(0, toNumber(getInputValue('stock-sale-fee')));
  const sellDate = getInputValue('stock-sale-date') || new Date().toISOString().slice(0, 10);
  const note = getInputValue('stock-sale-note');

  return { sourceLotId, symbol, shares, costPerShare, sellPrice, fee, sellDate, note };
}

// ── CSV ──
function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildCsv() {
  const account = getActiveAccount();
  const rows = [[
    'Type', 'Account', 'Symbol', 'Name', 'Shares', 'CostPerShare', 'SellPrice',
    'Fee', 'GrossAmount', 'Tax', 'Date', 'Tag', 'Note', 'TwdRate',
  ]];

  account.portfolio.forEach(lot => rows.push([
    'BUY', account.name, lot.symbol, lot.name, lot.shares, lot.avgCost, '',
    '', '', '', lot.buyDate, lot.tag, lot.note, lot.twdRate || '',
  ]));
  account.sales.forEach(sale => rows.push([
    'SELL', account.name, sale.symbol, '', sale.shares, sale.costPerShare, sale.sellPrice,
    sale.fee, '', '', sale.sellDate, '', sale.note,
  ]));
  account.dividends.forEach(dividend => rows.push([
    'DIVIDEND', account.name, dividend.symbol, '', '', '', '',
    '', dividend.amount, dividend.tax, dividend.payDate, '', dividend.note,
  ]));

  return rows.map(row => row.map(csvEscape).join(',')).join('\n');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some(value => value !== '')) rows.push(row);
  return rows;
}

function importCsvRows(rows) {
  if (rows.length < 2) return 0;
  const headers = rows[0].map(h => h.trim());
  const indexOf = name => headers.findIndex(header => header.toLowerCase() === name.toLowerCase());
  const get = (row, name) => row[indexOf(name)] || '';
  let imported = 0;

  rows.slice(1).forEach(row => {
    const type = get(row, 'Type').trim().toUpperCase();
    const accountName = get(row, 'Account').trim() || getActiveAccount().name;
    let account = stockState.accounts.find(item => item.name === accountName);
    if (!account) {
      account = createAccount(accountName);
      stockState.accounts.push(account);
    }

    if (type === 'BUY') {
      const lot = normalizeLot({
        symbol: get(row, 'Symbol'),
        name: get(row, 'Name'),
        shares: get(row, 'Shares'),
        avgCost: get(row, 'CostPerShare'),
        twdRate: get(row, 'TwdRate'),
        buyDate: get(row, 'Date'),
        tag: get(row, 'Tag'),
        note: get(row, 'Note'),
      });
      if (lot) {
        account.portfolio.push(lot);
        imported++;
      }
    } else if (type === 'SELL') {
      const sale = normalizeSale({
        symbol: get(row, 'Symbol'),
        shares: get(row, 'Shares'),
        costPerShare: get(row, 'CostPerShare'),
        sellPrice: get(row, 'SellPrice'),
        fee: get(row, 'Fee'),
        sellDate: get(row, 'Date'),
        note: get(row, 'Note'),
      });
      if (sale) {
        account.sales.push(sale);
        imported++;
      }
    } else if (type === 'DIVIDEND') {
      const dividend = normalizeDividend({
        symbol: get(row, 'Symbol'),
        amount: get(row, 'GrossAmount'),
        tax: get(row, 'Tax'),
        payDate: get(row, 'Date'),
        note: get(row, 'Note'),
      });
      if (dividend) {
        account.dividends.push(dividend);
        imported++;
      }
    }
  });

  return imported;
}

// ── Public API ──
const USStocks = {
  init() {
    loadPortfolio();
    updateTimeDisplay();
    if (_updateTimer) clearInterval(_updateTimer);
    _updateTimer = setInterval(updateTimeDisplay, 30000);
  },

  switchAccount(accountId) {
    setActiveAccount(accountId);
    renderStockUI();
  },

  addAccount() {
    setForm('account', null);
  },

  renameAccount() {
    setForm('account', 'rename');
  },

  saveAccount() {
    const name = getInputValue('stock-account-name');
    if (!name) return alert('請輸入帳戶名稱');
    
    if (stockState.form.editingId === 'rename') {
      const account = getActiveAccount();
      account.name = name;
    } else {
      const account = createAccount(name);
      stockState.accounts.push(account);
      stockState.activeAccountId = account.id;
    }
    
    stockState.form.type = null;
    stockState.form.editingId = null;
    savePortfolio();
    renderStockUI();
  },

  deleteAccount() {
    const account = getActiveAccount();
    if (stockState.accounts.length <= 1) {
      alert('至少需要保留一個帳戶');
      return;
    }
    if (!confirm(`確定要刪除「${account.name}」嗎？此帳戶的買賣與配息紀錄都會移除。`)) return;
    stockState.accounts = stockState.accounts.filter(item => item.id !== account.id);
    stockState.activeAccountId = stockState.accounts[0].id;
    savePortfolio();
    renderStockUI();
  },

  showBuyForm() {
    setForm('buy');
  },

  showSellForm(lotId = null) {
    setForm('sell', null, lotId);
  },

  showSellFormBySymbol(symbol) {
    const account = getActiveAccount();
    const lot = account.portfolio.find(item => item.symbol === symbol && item.shares > 0);
    setForm('sell', null, lot?.id || null);
  },

  showDividendForm() {
    setForm('dividend');
  },

  hideForm() {
    setForm(null);
  },

  editBuy(id) {
    setForm('buy', id);
  },

  editSale(id) {
    setForm('sell', id);
  },

  editDividend(id) {
    setForm('dividend', id);
  },

  quickSelect(symbol) {
    const symbolInput = document.getElementById('stock-symbol') || document.getElementById('stock-div-symbol') || document.getElementById('stock-sale-symbol');
    if (symbolInput) symbolInput.value = symbol;
  },

  selectSaleLot() {
    const account = getActiveAccount();
    const lotId = getInputValue('stock-sale-lot');
    const lot = account.portfolio.find(item => item.id === lotId);
    if (!lot) return;
    const symbolEl = document.getElementById('stock-sale-symbol');
    const sharesEl = document.getElementById('stock-sale-shares');
    const costEl = document.getElementById('stock-sale-cost');
    const priceEl = document.getElementById('stock-sale-price');
    if (symbolEl) symbolEl.value = lot.symbol;
    if (sharesEl && !sharesEl.value) sharesEl.value = lot.shares;
    if (costEl) costEl.value = lot.avgCost;
    if (priceEl && stockState.prices[lot.symbol]?.price) priceEl.value = stockState.prices[lot.symbol].price;
  },

  saveBuy() {
    const symbol = normalizeSymbol(getInputValue('stock-symbol'));
    const name = getInputValue('stock-name');
    const shares = toNumber(getInputValue('stock-shares'), NaN);
    const avgCost = toNumber(getInputValue('stock-cost'), NaN);
    const buyDate = getInputValue('stock-date') || new Date().toISOString().slice(0, 10);
    const tag = getInputValue('stock-tag');
    const note = getInputValue('stock-note');
    const twdRate = toNumber(getInputValue('stock-twd'), _twdRate.rate || 0);

    if (!symbol || !Number.isFinite(shares) || shares <= 0 || !Number.isFinite(avgCost) || avgCost < 0) {
      alert('請填寫完整的股票代碼、股數和成本');
      return;
    }

    addOrUpdateLot({
      id: stockState.form.editingId || createId('lot'),
      symbol,
      name: name || stockState.prices[symbol]?.name || symbol,
      shares,
      avgCost,
      twdRate,
      buyDate,
      tag,
      note,
    });

    stockState.form = { type: null, editingId: null, sourceLotId: null };
    savePortfolio();
    renderStockUI();
    refreshAllPrices().then(() => renderStockUI());
  },

  saveSale() {
    const account = getActiveAccount();
    const editingSale = stockState.form.editingId
      ? account.sales.find(sale => sale.id === stockState.form.editingId)
      : null;
    const saleData = getSaleFormData();

    if (!saleData.symbol || !Number.isFinite(saleData.shares) || saleData.shares <= 0 ||
      !Number.isFinite(saleData.costPerShare) || saleData.costPerShare < 0 ||
      !Number.isFinite(saleData.sellPrice) || saleData.sellPrice < 0) {
      alert('請填寫完整的賣出代碼、股數、成本與賣價');
      return;
    }

    if (saleData.sourceLotId) {
      const available = availableSharesForLot(account, saleData.sourceLotId, editingSale);
      if (saleData.shares > available + 0.000001) {
        alert(`賣出股數不可超過來源持股，目前可賣 ${formatNumber(available)} 股`);
        return;
      }
    }

    if (editingSale) restoreSaleToLot(account, editingSale);
    reduceLotForSale(account, saleData.sourceLotId, saleData.shares);

    const sale = {
      id: editingSale?.id || createId('sale'),
      ...saleData,
    };
    sale.realizedPL = calcSalePL(sale);

    const existingIndex = account.sales.findIndex(item => item.id === sale.id);
    if (existingIndex >= 0) account.sales[existingIndex] = sale;
    else account.sales.push(sale);

    stockState.form = { type: null, editingId: null, sourceLotId: null };
    savePortfolio();
    renderStockUI();
  },

  saveDividend() {
    const account = getActiveAccount();
    const symbol = normalizeSymbol(getInputValue('stock-div-symbol'));
    const amount = toNumber(getInputValue('stock-div-amount'), NaN);
    const tax = Math.max(0, toNumber(getInputValue('stock-div-tax')));
    const payDate = getInputValue('stock-div-date') || new Date().toISOString().slice(0, 10);
    const note = getInputValue('stock-div-note');

    if (!symbol || !Number.isFinite(amount) || amount <= 0) {
      alert('請填寫完整的股票代碼與配息總額');
      return;
    }

    const dividend = {
      id: stockState.form.editingId || createId('div'),
      symbol,
      amount,
      tax,
      payDate,
      note,
    };
    const existingIndex = account.dividends.findIndex(item => item.id === dividend.id);
    if (existingIndex >= 0) account.dividends[existingIndex] = dividend;
    else account.dividends.push(dividend);

    stockState.form = { type: null, editingId: null, sourceLotId: null };
    savePortfolio();
    renderStockUI();
  },

  deleteBuy(id) {
    const account = getActiveAccount();
    const lot = account.portfolio.find(item => item.id === id);
    if (!lot) return;
    if (!confirm(`確定要刪除 ${lot.symbol} 這筆買入紀錄嗎？`)) return;
    account.portfolio = account.portfolio.filter(item => item.id !== id);
    account.sales.forEach(sale => {
      if (sale.sourceLotId === id) sale.sourceLotId = '';
    });
    savePortfolio();
    renderStockUI();
  },

  deleteSale(id) {
    const account = getActiveAccount();
    const sale = account.sales.find(item => item.id === id);
    if (!sale) return;
    if (!confirm(`確定要刪除 ${sale.symbol} 這筆賣出紀錄嗎？相關股數會退回來源持股。`)) return;
    restoreSaleToLot(account, sale);
    account.sales = account.sales.filter(item => item.id !== id);
    savePortfolio();
    renderStockUI();
  },

  deleteDividend(id) {
    const account = getActiveAccount();
    const dividend = account.dividends.find(item => item.id === id);
    if (!dividend) return;
    if (!confirm(`確定要刪除 ${dividend.symbol} 這筆收入紀錄嗎？`)) return;
    account.dividends = account.dividends.filter(item => item.id !== id);
    savePortfolio();
    renderStockUI();
  },

  toggleClosedLots() {
    stockState.showClosedLots = !stockState.showClosedLots;
    renderStockUI();
  },

  setFilter(value) {
    stockState.filter = value;
    renderStockUI();
    const input = document.getElementById('stock-filter');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  },

  async refreshPrices() {
    const btn = document.getElementById('stock-refresh-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '更新中...';
    }
    showToast('正在更新股價...');
    const result = await refreshAllPrices({ force: true });
    renderStockUI();
    if (result.updated > 0 && result.failed.length === 0) {
      showToast(`已更新 ${result.updated} 檔股價`);
    } else if (result.updated > 0) {
      showToast(`已更新 ${result.updated} 檔，${result.failed.join(', ')} 更新失敗`);
    } else {
      showToast('股價更新失敗，請稍後再試');
    }
  },

  saveTwdRate(value) {
    const rate = toNumber(value, 0);
    if (rate <= 0) {
      showToast('請輸入有效的匯率');
      return;
    }
    saveTwdRate(rate);
    renderStockUI();
    showToast(`台幣匯率已設為 ${rate}`);
  },

  exportCsv() {
    const account = getActiveAccount();
    const blob = new Blob([buildCsv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `us-stocks-${account.name}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importCsvRows(parseCsv(String(reader.result || '')));
        savePortfolio();
        renderStockUI();
        showToast(`已匯入 ${imported} 筆紀錄`);
      } catch (e) {
        alert('匯入失敗: ' + e.message);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  },
};

// ── Render + init ──
function renderStockUI() {
  const container = document.getElementById('stock-container');
  if (!container) return;
  container.innerHTML = renderPortfolio();
  updateTimeDisplay();
}

function showToast(msg) {
  const existing = document.querySelector('.stock-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'stock-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

function updateTimeDisplay() {
  const el = document.getElementById('stock-update-time');
  if (!el) return;
  const symbols = getTrackedSymbols();
  const prices = symbols.map(symbol => stockState.prices[symbol]).filter(Boolean);
  if (prices.length === 0) {
    el.textContent = '尚未更新股價';
    return;
  }
  const latest = Math.max(...prices.map(p => p.updatedAt));
  const mins = Math.round((Date.now() - latest) / 60000);
  el.textContent = mins <= 0 ? '剛剛更新' : `${mins} 分鐘前更新`;
  setSyncStatus(_cloudSyncStatus);
}

// 暴露到全域
window.USStocks = USStocks;

// 提供 render function 給 app.js 的 renderFields
export function render() {
  return '<div id="stock-container"></div>';
}

export function init() {
  loadPortfolio();
  renderStockUI();
  USStocks.init();

  (async () => {
    const localHasData = stockState.accounts.some(a =>
      a.portfolio.length || a.sales.length || a.dividends.length
    );
    const pull = await pullStateFromCloud();
    if (pull.ok && pull.hasRemote) {
      renderStockUI();
    } else if (pull.ok && !pull.hasRemote && localHasData) {
      await pushStateToCloud();
    }
    refreshAllPrices().then(() => renderStockUI());
  })();
}
