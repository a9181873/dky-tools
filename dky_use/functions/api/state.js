// Cloudflare Pages Function - 美股 state 雲端同步
// KV-backed; 單一使用者 single namespace

const KV_KEY = 'us-stocks:default';
const MAX_BODY_BYTES = 1_000_000;

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!env.API_TOKEN || token !== env.API_TOKEN) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (!env.STOCK_KV) {
    return new Response(JSON.stringify({ success: false, error: 'STOCK_KV namespace not bound' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    if (request.method === 'GET') {
      const raw = await env.STOCK_KV.get(KV_KEY);
      if (!raw) {
        return new Response(JSON.stringify({ success: true, state: null, updatedAt: 0 }), { headers: corsHeaders });
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Stored data corrupted' }), {
          status: 500,
          headers: corsHeaders,
        });
      }
      return new Response(JSON.stringify({
        success: true,
        state: parsed.state || null,
        updatedAt: Number(parsed.updatedAt) || 0,
      }), { headers: corsHeaders });
    }

    if (request.method === 'PUT') {
      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) {
        return new Response(JSON.stringify({ success: false, error: 'Payload too large' }), {
          status: 413,
          headers: corsHeaders,
        });
      }
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      if (!body || typeof body.state !== 'object' || body.state === null) {
        return new Response(JSON.stringify({ success: false, error: 'Missing state object' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      const record = {
        state: body.state,
        updatedAt: Number(body.updatedAt) || Date.now(),
      };
      await env.STOCK_KV.put(KV_KEY, JSON.stringify(record));
      return new Response(JSON.stringify({ success: true, updatedAt: record.updatedAt }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
