/* DKY US Stocks - Google Sheets 後端
 * 部署方式：
 * 1. 打開你的 Google Sheet
 * 2. 擴充功能 → Apps Script
 * 3. 貼上這整份程式碼
 * 4. 點「部署」→「新部署」→ 類型選「網路應用程式」
 * 5. 「執行身分」選「我」，「誰可以存取」選「任何人」
 * 6. 複製部署網址，貼回美股工具的「Apps Script Web App URL」
 * 7. 首次執行需授權 Google Sheets 權限
 *
 * Sheet 結構 (自動建立)：
 *   Portfolio: Symbol | Name | Shares | AvgCost | BuyDate | CurrentPrice | MarketValue | PL | PL% | UpdatedAt
 *   Settings: Key | Value (PasswordHash, LastSync)
 */

const SHEET_PORTFOLIO = 'Portfolio';
const SHEET_SETTINGS = 'Settings';

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const action = e.parameter.action || (e.postData ? JSON.parse(e.postData.contents).action : '');
    const data = e.postData ? JSON.parse(e.postData.contents) : {};

    switch (action) {
      case 'sync':
        return syncPortfolio(data);
      case 'load':
        return loadPortfolio();
      default:
        return json({ error: 'Unknown action: ' + action }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function syncPortfolio(data) {
  const portfolio = data.portfolio || [];
  const prices = data.prices || {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_PORTFOLIO, [
    'Symbol', 'Name', 'Shares', 'AvgCost', 'BuyDate',
    'CurrentPrice', 'MarketValue', 'P&L', 'P&L%', 'UpdatedAt'
  ]);

  // Clear existing data (skip header)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).clearContent();
  }

  // Write rows
  const rows = portfolio.map(h => {
    const price = prices[h.symbol] || {};
    const currentPrice = price.price || 0;
    const marketValue = currentPrice * h.shares;
    const costBasis = h.avgCost * h.shares;
    const pl = marketValue - costBasis;
    const plPercent = costBasis > 0 ? (pl / costBasis) : 0;

    return [
      h.symbol,
      h.name || h.symbol,
      h.shares,
      h.avgCost,
      h.buyDate,
      currentPrice,
      Math.round(marketValue * 100) / 100,
      Math.round(pl * 100) / 100,
      Math.round(plPercent * 10000) / 100,
      price.updatedAt ? new Date(price.updatedAt).toISOString() : ''
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 10).setValues(rows);
  }

  // Update settings
  const settingsSheet = getOrCreateSheet(ss, SHEET_SETTINGS, ['Key', 'Value']);
  upsertSetting(settingsSheet, 'LastSync', new Date().toISOString());

  return json({ success: true, rows: rows.length });
}

function loadPortfolio() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PORTFOLIO);
  if (!sheet || sheet.getLastRow() <= 1) {
    return json({ success: true, portfolio: [] });
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const portfolio = data.slice(1).map(row => ({
    symbol: row[0],
    name: row[1] || row[0],
    shares: Number(row[2]) || 0,
    avgCost: Number(row[3]) || 0,
    buyDate: row[4] || '',
  })).filter(h => h.symbol && h.shares > 0);

  return json({ success: true, portfolio: portfolio });
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
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

function json(obj, status) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
