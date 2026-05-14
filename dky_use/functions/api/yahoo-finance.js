// Cloudflare Pages Function - Yahoo Finance Proxy
// 解決瀏覽器 CORS 限制，代理 Yahoo Finance API 請求

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const action = url.searchParams.get('action') || 'quote';
  const symbols = url.searchParams.get('symbols') || '';

  if (!symbols) {
    return new Response(JSON.stringify({ success: false, error: 'Missing symbols parameter' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    let prices = {};

    if (action === 'quote') {
      prices = await fetchYahooQuote(symbols);
    } else if (action === 'chart') {
      // Single symbol chart fallback
      const symbol = symbols.split(',')[0].trim();
      prices = await fetchYahooChart(symbol);
    }

    return new Response(JSON.stringify({ success: true, prices }), {
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

async function fetchYahooQuote(symbolsStr) {
  const symbols = symbolsStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (symbols.length === 0) return {};

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!resp.ok) {
    // Fallback to v8 chart API if v7 quote fails
    const prices = {};
    const results = await Promise.allSettled(symbols.map(s => fetchYahooChart(s)));
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        Object.assign(prices, result.value);
      }
    });
    return prices;
  }

  const data = await resp.json();
  const results = data?.quoteResponse?.result || [];
  const prices = {};

  results.forEach(item => {
    const symbol = (item.symbol || '').toUpperCase();
    if (!symbol || typeof item.regularMarketPrice !== 'number') return;

    const previousClose = item.regularMarketPreviousClose || item.regularMarketPrice;
    const change = typeof item.regularMarketChange === 'number'
      ? item.regularMarketChange
      : item.regularMarketPrice - previousClose;
    const changePercent = typeof item.regularMarketChangePercent === 'number'
      ? item.regularMarketChangePercent
      : (previousClose > 0 ? (change / previousClose) * 100 : 0);

    prices[symbol] = {
      symbol,
      price: item.regularMarketPrice,
      previousClose,
      change,
      changePercent,
      currency: item.currency || 'USD',
      name: item.longName || item.shortName || symbol,
      updatedAt: Date.now(),
      source: 'Yahoo via CF Proxy',
    };
  });

  return prices;
}

async function fetchYahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!resp.ok) throw new Error(`Yahoo chart HTTP ${resp.status}`);

  const data = await resp.json();
  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta || typeof meta.regularMarketPrice !== 'number') {
    throw new Error('No chart metadata for ' + symbol);
  }

  const previousClose = meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice;
  const change = meta.regularMarketPrice - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  return {
    [symbol.toUpperCase()]: {
      symbol: symbol.toUpperCase(),
      price: meta.regularMarketPrice,
      previousClose,
      change,
      changePercent,
      currency: meta.currency || 'USD',
      name: meta.longName || meta.shortName || symbol,
      updatedAt: Date.now(),
      source: 'Yahoo chart via CF Proxy',
    },
  };
}
