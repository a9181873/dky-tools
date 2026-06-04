// Cloudflare Pages Function - US stocks cloud state.
// D1 is the primary store; KV is kept as a migration source and mirror backup.

const KV_KEY = 'us-stocks:default';
const MAX_BODY_BYTES = 1_000_000;
const DEFAULT_API_TOKEN = 'bcd67b59cd18fdd2c7e4675c46e0126a3d6cacdf4811263e8c3725436f3c4fb2';
let schemaReadyPromise = null;

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
  const apiToken = env.API_TOKEN || DEFAULT_API_TOKEN;
  if (token !== apiToken) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, corsHeaders, 401);
  }

  if (!env.STOCK_DB && !env.STOCK_KV) {
    return jsonResponse({ success: false, error: 'No storage binding configured' }, corsHeaders, 500);
  }

  try {
    if (request.method === 'GET') {
      const record = await readBestRecord(context);
      return jsonResponse({
        success: true,
        state: record?.state || null,
        updatedAt: record?.updatedAt || 0,
      }, corsHeaders);
    }

    if (request.method === 'PUT') {
      const record = await parseStateRequest(request, corsHeaders);
      if (record instanceof Response) return record;

      const result = await writePrimaryRecord(context, record);
      if (!result.ok) {
        return jsonResponse({ success: false, error: result.error }, corsHeaders, 503);
      }

      mirrorToKv(context, record);
      return jsonResponse({ success: true, updatedAt: record.updatedAt }, corsHeaders);
    }

    return jsonResponse({ success: false, error: 'Method not allowed' }, corsHeaders, 405);
  } catch (err) {
    return jsonResponse({ success: false, error: errorMessage(err) }, corsHeaders, 500);
  }
}

async function readBestRecord(context) {
  const { env } = context;

  if (env.STOCK_DB) {
    try {
      await ensureD1Schema(env.STOCK_DB);
      const d1Record = await readD1Record(env.STOCK_DB);
      if (d1Record) return d1Record;

      const kvRecord = await readKvRecord(env.STOCK_KV);
      if (kvRecord) {
        try {
          await writeD1Record(env.STOCK_DB, kvRecord);
        } catch (err) {
          console.warn('D1 lazy migration failed:', errorMessage(err));
        }
        return kvRecord;
      }
      return null;
    } catch (err) {
      console.warn('D1 read failed, falling back to KV:', errorMessage(err));
      const kvRecord = await readKvRecord(env.STOCK_KV);
      if (kvRecord) return kvRecord;
      throw err;
    }
  }

  return readKvRecord(env.STOCK_KV);
}

async function writePrimaryRecord(context, record) {
  const { env } = context;

  if (env.STOCK_DB) {
    try {
      await ensureD1Schema(env.STOCK_DB);
      await writeD1Record(env.STOCK_DB, record);
      return { ok: true };
    } catch (err) {
      let backupSaved = false;
      if (env.STOCK_KV) {
        try {
          await writeKvRecord(env.STOCK_KV, record);
          backupSaved = true;
        } catch (kvErr) {
          console.warn('KV backup after D1 write failure failed:', errorMessage(kvErr));
        }
      }
      const suffix = backupSaved ? '; saved backup to KV' : '';
      return { ok: false, error: `D1 write failed${suffix}: ${errorMessage(err)}` };
    }
  }

  if (env.STOCK_KV) {
    await writeKvRecord(env.STOCK_KV, record);
    return { ok: true };
  }

  return { ok: false, error: 'No storage binding configured' };
}

async function parseStateRequest(request, headers) {
  const text = await request.text();
  if (byteLength(text) > MAX_BODY_BYTES) {
    return jsonResponse({ success: false, error: 'Payload too large' }, headers, 413);
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, headers, 400);
  }

  if (!body || typeof body.state !== 'object' || body.state === null) {
    return jsonResponse({ success: false, error: 'Missing state object' }, headers, 400);
  }

  return {
    state: body.state,
    updatedAt: Number(body.updatedAt) || Date.now(),
  };
}

async function ensureD1Schema(db) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS stock_state (
          state_key TEXT PRIMARY KEY,
          state_json TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          updated_at INTEGER NOT NULL,
          checksum TEXT NOT NULL
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS stock_state_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          state_key TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          checksum TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `),
      db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_stock_state_events_state_created
        ON stock_state_events (state_key, created_at)
      `),
    ]).catch(err => {
      schemaReadyPromise = null;
      throw err;
    });
  }

  await schemaReadyPromise;
}

async function readD1Record(db) {
  const row = await db.prepare(`
    SELECT state_json, updated_at
    FROM stock_state
    WHERE state_key = ?1
  `).bind(KV_KEY).first();

  if (!row) return null;

  let state;
  try {
    state = JSON.parse(row.state_json);
  } catch {
    throw new Error('Stored D1 data corrupted');
  }

  return normalizeRecord({ state, updatedAt: row.updated_at });
}

async function writeD1Record(db, record) {
  const stateJson = JSON.stringify(record.state);
  const checksum = await sha256Hex(stateJson);
  const version = Number(record.state?.version) || 1;
  const updatedAt = Number(record.updatedAt) || Date.now();
  const createdAt = Date.now();

  await db.batch([
    db.prepare(`
      INSERT INTO stock_state (state_key, state_json, version, updated_at, checksum)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT(state_key) DO UPDATE SET
        state_json = excluded.state_json,
        version = excluded.version,
        updated_at = excluded.updated_at,
        checksum = excluded.checksum
    `).bind(KV_KEY, stateJson, version, updatedAt, checksum),
    db.prepare(`
      INSERT INTO stock_state_events (state_key, updated_at, checksum, created_at)
      VALUES (?1, ?2, ?3, ?4)
    `).bind(KV_KEY, updatedAt, checksum, createdAt),
  ]);
}

async function readKvRecord(kv) {
  if (!kv) return null;

  const raw = await kv.get(KV_KEY);
  if (!raw) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Stored KV data corrupted');
  }

  return normalizeRecord(parsed);
}

async function writeKvRecord(kv, record) {
  await kv.put(KV_KEY, JSON.stringify({
    state: record.state,
    updatedAt: Number(record.updatedAt) || Date.now(),
  }));
}

function mirrorToKv(context, record) {
  if (!context.env.STOCK_KV) return;

  const task = writeKvRecord(context.env.STOCK_KV, record)
    .catch(err => console.warn('KV mirror write failed:', errorMessage(err)));

  if (typeof context.waitUntil === 'function') {
    context.waitUntil(task);
  }
}

function normalizeRecord(record) {
  if (!record || typeof record.state !== 'object' || record.state === null) {
    return null;
  }

  return {
    state: record.state,
    updatedAt: Number(record.updatedAt) || 0,
  };
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

function jsonResponse(body, headers, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}
