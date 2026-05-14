/* DKY US Stocks - Google Sheets 後端
 * 部署方式：
 * 1. 打開你的 Google Sheet
 * 2. 擴充功能 → Apps Script
 * 3. 貼上這整份程式碼
 * 4. 點「部署」→「新部署」→ 類型選「網路應用程式」
 * 5. 「執行身分」選「我」，「誰可以存取」選「任何人」
 * 6. 複製部署網址，貼回美股工具的「Apps Script Web App URL」
 *
 * Sheet 結構會自動建立：
 *   Accounts: AccountId | AccountName
 *   Lots: AccountId | AccountName | LotId | Symbol | Name | Shares | AvgCost | BuyDate | Tag | Note | TwdRate
 *   Sales: AccountId | AccountName | SaleId | SourceLotId | Symbol | Shares | CostPerShare | SellPrice | Fee | RealizedPL | SellDate | Note
 *   Dividends: AccountId | AccountName | DividendId | Symbol | Amount | Tax | NetAmount | PayDate | Note
 *   Prices: Symbol | Name | Price | Change | ChangePercent | Currency | Source | UpdatedAt
 *   Settings: Key | Value (StateJson, LastSync)
 */

const SHEET_ACCOUNTS = 'Accounts';
const SHEET_LOTS = 'Lots';
const SHEET_SALES = 'Sales';
const SHEET_DIVIDENDS = 'Dividends';
const SHEET_PRICES = 'Prices';
const SHEET_SETTINGS = 'Settings';

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const body = parseBody(e);
    const action = (e && e.parameter && e.parameter.action) || body.action || '';

    switch (action) {
      case 'sync':
        return syncState(body);
      case 'load':
        return loadState();
      case 'prices':
        return getPrices((e.parameter.symbols || body.symbols || '').split(','));
      default:
        return json({ success: false, error: 'Unknown action: ' + action }, 400);
    }
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

function parseBody(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

function syncState(data) {
  const state = normalizeState(data.state || {});
  const prices = data.prices || state.prices || {};
  state.prices = prices;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  writeAccounts(ss, state.accounts);
  writeLots(ss, state.accounts);
  writeSales(ss, state.accounts);
  writeDividends(ss, state.accounts);
  writePrices(ss, prices);

  const settingsSheet = getOrCreateSheet(ss, SHEET_SETTINGS, ['Key', 'Value']);
  upsertSetting(settingsSheet, 'StateJson', JSON.stringify(state));
  upsertSetting(settingsSheet, 'LastSync', new Date().toISOString());

  const rowCount = state.accounts.reduce(function(sum, account) {
    return sum + account.portfolio.length + account.sales.length + account.dividends.length;
  }, 0);

  return json({ success: true, rows: rowCount });
}

function loadState() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName(SHEET_SETTINGS);
  const savedJson = settingsSheet ? getSetting(settingsSheet, 'StateJson') : '';
  if (savedJson) {
    return json({ success: true, state: normalizeState(JSON.parse(savedJson)) });
  }

  return json({ success: true, state: readStateFromSheets(ss) });
}

function getPrices(symbols) {
  const normalized = symbols
    .map(function(symbol) { return String(symbol || '').trim().toUpperCase(); })
    .filter(function(symbol, index, arr) { return symbol && arr.indexOf(symbol) === index; });

  if (normalized.length === 0) {
    return json({ success: true, prices: {} });
  }

  const prices = {};
  const chunkSize = 35;
  for (let i = 0; i < normalized.length; i += chunkSize) {
    const chunk = normalized.slice(i, i + chunkSize);
    const url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + encodeURIComponent(chunk.join(','));
    const resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (resp.getResponseCode() < 200 || resp.getResponseCode() >= 300) {
      continue;
    }

    const data = JSON.parse(resp.getContentText());
    const results = data && data.quoteResponse && data.quoteResponse.result ? data.quoteResponse.result : [];
    results.forEach(function(item) {
      const symbol = String(item.symbol || '').toUpperCase();
      if (!symbol || typeof item.regularMarketPrice !== 'number') return;
      const previousClose = item.regularMarketPreviousClose || item.regularMarketPrice;
      const change = typeof item.regularMarketChange === 'number'
        ? item.regularMarketChange
        : item.regularMarketPrice - previousClose;
      const changePercent = typeof item.regularMarketChangePercent === 'number'
        ? item.regularMarketChangePercent
        : (previousClose ? change / previousClose * 100 : 0);

      prices[symbol] = {
        symbol: symbol,
        price: item.regularMarketPrice,
        previousClose: previousClose,
        change: change,
        changePercent: changePercent,
        currency: item.currency || 'USD',
        name: item.longName || item.shortName || symbol,
        updatedAt: Date.now(),
        source: 'Yahoo via Apps Script',
      };
    });
  }

  return json({ success: true, prices: prices });
}

function normalizeState(state) {
  const accounts = Array.isArray(state.accounts) && state.accounts.length
    ? state.accounts.map(normalizeAccount)
    : [{ id: 'acct_A', name: 'A', portfolio: [], sales: [], dividends: [] }];

  const activeAccountId = accounts.some(function(account) { return account.id === state.activeAccountId; })
    ? state.activeAccountId
    : accounts[0].id;

  return {
    version: 2,
    activeAccountId: activeAccountId,
    accounts: accounts,
    prices: state.prices || {},
  };
}

function normalizeAccount(account) {
  return {
    id: account.id || ('acct_' + Utilities.getUuid()),
    name: account.name || '新帳戶',
    portfolio: Array.isArray(account.portfolio) ? account.portfolio.map(normalizeLot).filter(Boolean) : [],
    sales: Array.isArray(account.sales) ? account.sales.map(normalizeSale).filter(Boolean) : [],
    dividends: Array.isArray(account.dividends) ? account.dividends.map(normalizeDividend).filter(Boolean) : [],
  };
}

function normalizeLot(lot) {
  const symbol = String(lot.symbol || '').trim().toUpperCase();
  if (!symbol) return null;
  return {
    id: lot.id || ('lot_' + Utilities.getUuid()),
    symbol: symbol,
    name: lot.name || symbol,
    shares: Number(lot.shares) || 0,
    avgCost: Number(lot.avgCost) || 0,
    twdRate: Number(lot.twdRate) || 0,
    buyDate: formatDateValue(lot.buyDate || lot.date),
    tag: lot.tag || '',
    note: lot.note || '',
  };
}

function normalizeSale(sale) {
  const symbol = String(sale.symbol || '').trim().toUpperCase();
  const shares = Number(sale.shares) || 0;
  if (!symbol || shares <= 0) return null;
  const normalized = {
    id: sale.id || ('sale_' + Utilities.getUuid()),
    sourceLotId: sale.sourceLotId || '',
    symbol: symbol,
    shares: shares,
    costPerShare: Number(sale.costPerShare) || 0,
    sellPrice: Number(sale.sellPrice) || 0,
    fee: Number(sale.fee) || 0,
    sellDate: formatDateValue(sale.sellDate || sale.date),
    note: sale.note || '',
  };
  normalized.realizedPL = roundMoney((normalized.sellPrice - normalized.costPerShare) * normalized.shares - normalized.fee);
  return normalized;
}

function normalizeDividend(dividend) {
  const symbol = String(dividend.symbol || '').trim().toUpperCase();
  const amount = Number(dividend.amount) || 0;
  if (!symbol || amount <= 0) return null;
  return {
    id: dividend.id || ('div_' + Utilities.getUuid()),
    symbol: symbol,
    amount: amount,
    tax: Number(dividend.tax) || 0,
    payDate: formatDateValue(dividend.payDate || dividend.date),
    note: dividend.note || '',
  };
}

function readStateFromSheets(ss) {
  const accountsMap = {};
  const accountsSheet = ss.getSheetByName(SHEET_ACCOUNTS);
  if (accountsSheet && accountsSheet.getLastRow() > 1) {
    const data = accountsSheet.getDataRange().getValues();
    data.slice(1).forEach(function(row) {
      const id = row[0];
      if (!id) return;
      accountsMap[id] = { id: id, name: row[1] || id, portfolio: [], sales: [], dividends: [] };
    });
  }

  const ensureAccount = function(id, name) {
    const accountId = id || 'acct_A';
    if (!accountsMap[accountId]) {
      accountsMap[accountId] = { id: accountId, name: name || accountId, portfolio: [], sales: [], dividends: [] };
    }
    return accountsMap[accountId];
  };

  const lotsSheet = ss.getSheetByName(SHEET_LOTS) || ss.getSheetByName('Portfolio');
  if (lotsSheet && lotsSheet.getLastRow() > 1) {
    const data = lotsSheet.getDataRange().getValues();
    data.slice(1).forEach(function(row) {
      const legacy = lotsSheet.getName() === 'Portfolio';
      const account = ensureAccount(legacy ? 'acct_A' : row[0], legacy ? 'A' : row[1]);
      const lot = normalizeLot(legacy ? {
        symbol: row[0], name: row[1], shares: row[2], avgCost: row[3], buyDate: row[4],
      } : {
        id: row[2], symbol: row[3], name: row[4], shares: row[5], avgCost: row[6],
        buyDate: row[7], tag: row[8], note: row[9], twdRate: row[10],
      });
      if (lot) account.portfolio.push(lot);
    });
  }

  const salesSheet = ss.getSheetByName(SHEET_SALES);
  if (salesSheet && salesSheet.getLastRow() > 1) {
    const data = salesSheet.getDataRange().getValues();
    data.slice(1).forEach(function(row) {
      const account = ensureAccount(row[0], row[1]);
      const sale = normalizeSale({
        id: row[2], sourceLotId: row[3], symbol: row[4], shares: row[5], costPerShare: row[6],
        sellPrice: row[7], fee: row[8], sellDate: row[10], note: row[11],
      });
      if (sale) account.sales.push(sale);
    });
  }

  const dividendsSheet = ss.getSheetByName(SHEET_DIVIDENDS);
  if (dividendsSheet && dividendsSheet.getLastRow() > 1) {
    const data = dividendsSheet.getDataRange().getValues();
    data.slice(1).forEach(function(row) {
      const account = ensureAccount(row[0], row[1]);
      const dividend = normalizeDividend({
        id: row[2], symbol: row[3], amount: row[4], tax: row[5], payDate: row[7], note: row[8],
      });
      if (dividend) account.dividends.push(dividend);
    });
  }

  const prices = {};
  const pricesSheet = ss.getSheetByName(SHEET_PRICES);
  if (pricesSheet && pricesSheet.getLastRow() > 1) {
    const data = pricesSheet.getDataRange().getValues();
    data.slice(1).forEach(function(row) {
      const symbol = String(row[0] || '').toUpperCase();
      if (!symbol) return;
      prices[symbol] = {
        symbol: symbol,
        name: row[1] || symbol,
        price: Number(row[2]) || 0,
        change: Number(row[3]) || 0,
        changePercent: Number(row[4]) || 0,
        currency: row[5] || 'USD',
        source: row[6] || 'Sheet',
        updatedAt: row[7] ? Number(row[7]) || Date.parse(row[7]) || Date.now() : Date.now(),
      };
    });
  }

  const accounts = Object.keys(accountsMap).map(function(id) { return accountsMap[id]; });
  return normalizeState({ accounts: accounts, prices: prices });
}

function writeAccounts(ss, accounts) {
  const sheet = getOrCreateSheet(ss, SHEET_ACCOUNTS, ['AccountId', 'AccountName']);
  clearData(sheet, 2);
  const rows = accounts.map(function(account) { return [account.id, account.name]; });
  writeRows(sheet, rows);
}

function writeLots(ss, accounts) {
  const headers = ['AccountId', 'AccountName', 'LotId', 'Symbol', 'Name', 'Shares', 'AvgCost', 'BuyDate', 'Tag', 'Note', 'TwdRate'];
  const sheet = getOrCreateSheet(ss, SHEET_LOTS, headers);
  clearData(sheet, headers.length);
  const rows = [];
  accounts.forEach(function(account) {
    account.portfolio.forEach(function(lot) {
      rows.push([account.id, account.name, lot.id, lot.symbol, lot.name, lot.shares, lot.avgCost, lot.buyDate, lot.tag, lot.note, lot.twdRate || 0]);
    });
  });
  writeRows(sheet, rows);
}

function writeSales(ss, accounts) {
  const headers = ['AccountId', 'AccountName', 'SaleId', 'SourceLotId', 'Symbol', 'Shares', 'CostPerShare', 'SellPrice', 'Fee', 'RealizedPL', 'SellDate', 'Note'];
  const sheet = getOrCreateSheet(ss, SHEET_SALES, headers);
  clearData(sheet, headers.length);
  const rows = [];
  accounts.forEach(function(account) {
    account.sales.forEach(function(sale) {
      const realizedPL = roundMoney((Number(sale.sellPrice) - Number(sale.costPerShare)) * Number(sale.shares) - Number(sale.fee || 0));
      rows.push([account.id, account.name, sale.id, sale.sourceLotId, sale.symbol, sale.shares, sale.costPerShare, sale.sellPrice, sale.fee, realizedPL, sale.sellDate, sale.note]);
    });
  });
  writeRows(sheet, rows);
}

function writeDividends(ss, accounts) {
  const headers = ['AccountId', 'AccountName', 'DividendId', 'Symbol', 'Amount', 'Tax', 'NetAmount', 'PayDate', 'Note'];
  const sheet = getOrCreateSheet(ss, SHEET_DIVIDENDS, headers);
  clearData(sheet, headers.length);
  const rows = [];
  accounts.forEach(function(account) {
    account.dividends.forEach(function(dividend) {
      rows.push([account.id, account.name, dividend.id, dividend.symbol, dividend.amount, dividend.tax, roundMoney(Number(dividend.amount) - Number(dividend.tax || 0)), dividend.payDate, dividend.note]);
    });
  });
  writeRows(sheet, rows);
}

function writePrices(ss, prices) {
  const headers = ['Symbol', 'Name', 'Price', 'Change', 'ChangePercent', 'Currency', 'Source', 'UpdatedAt'];
  const sheet = getOrCreateSheet(ss, SHEET_PRICES, headers);
  clearData(sheet, headers.length);
  const rows = Object.keys(prices).sort().map(function(symbol) {
    const price = prices[symbol] || {};
    return [
      symbol,
      price.name || symbol,
      Number(price.price) || 0,
      Number(price.change) || 0,
      Number(price.changePercent) || 0,
      price.currency || 'USD',
      price.source || '',
      price.updatedAt || '',
    ];
  });
  writeRows(sheet, rows);
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  const currentHeaders = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn())).getValues()[0]
    : [];
  const needsHeader = headers.some(function(header, index) { return currentHeaders[index] !== header; });
  if (needsHeader) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clearData(sheet, columns) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, columns).clearContent();
  }
}

function writeRows(sheet, rows) {
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function getSetting(sheet, key) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return '';
}

function upsertSetting(sheet, key, value) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function formatDateValue(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value).slice(0, 10);
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function json(obj, status) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
