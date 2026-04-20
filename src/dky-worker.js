// DKYC.INFO 專用 Worker：處理 JWT 解碼、Cron 生成、雜湊計算等
self.addEventListener('message', (e) => {
  const { type, payload } = e.data;
  let result;
  switch (type) {
    case 'jwt-decode':
      result = decodeJWT(payload.token);
      break;
    case 'cron-next':
      result = nextCronTimes(payload.cron, payload.count || 5);
      break;
    case 'hash':
      result = hash(payload.text, algo(payload.algo || 'sha-256'));
      break;
    case 'password-strength':
      result = checkPassword(payload.password);
      break;
    case 'ssl-check':
      result = checkSSL(payload.domain);
      break;
    case 'ip-lookup':
      result = lookupIP(payload.ip);
      break;
    default:
      result = { error: 'Unknown type' };
  }
  self.postMessage(result);
});

// JWT decode (no verification)
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { error: 'Invalid JWT format' };
    const decode = (s) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')));
    return { header: decode(parts[0]), payload: decode(parts[1]), signature: parts[2] };
  } catch (e) {
    return { error: 'Decode failed' };
  }
}

// Simple cron next N times (supports step and range)
function nextCronTimes(cron, n = 5) {
  // Very basic parser: "m h dom mon dow"
  const [m, h, dom, mon, dow] = cron.trim().split(/\s+/);
  const times = [];
  const now = new Date();
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);
  const limit = 10000;
  while (times.length < n && limit-- > 0) {
    cursor = new Date(cursor.getTime() + 60000);
    if (matchField(m, cursor.getMinutes(), 0, 59) &&
        matchField(h, cursor.getHours(), 0, 23) &&
        matchField(dom, cursor.getDate(), 1, 31) &&
        matchField(mon, cursor.getMonth() + 1, 1, 12) &&
        matchField(dow, cursor.getDay(), 0, 7)) {
      times.push(new Date(cursor).toISOString());
    }
  }
  return times;
}
function matchField(field, val, min, max) {
  if (field === '*') return true;
  const list = field.split(',');
  for (const item of list) {
    const [range, stepStr] = item.split('/');
    const step = stepStr ? parseInt(stepStr) : 1;
    const [lo, hi] = range.includes('-') ? range.split('-').map(Number) : [parseInt(range), parseInt(range)];
    if (val >= lo && val <= hi && (val - lo) % step === 0) return true;
  }
  return false;
}

// Hash
async function hash(text, algo) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest(algo, enc.encode(text));
  return '0x' + [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function algo(name) {
  const map = { 'md5': 'MD5', 'sha-1': 'SHA-1', 'sha-256': 'SHA-256', 'sha-512': 'SHA-512' };
  return map[name] || 'SHA-256';
}

// Password strength (simple)
function checkPassword(p) {
  const len = p.length;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasDigit = /\d/.test(p);
  const hasSym = /[^A-Za-z0-9]/.test(p);
  let score = 0;
  if (len >= 8) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasDigit) score++;
  if (hasSym) score++;
  const levels = ['Weak', 'Fair', 'Medium', 'Strong', 'Very Strong'];
  return { score: Math.min(score, levels.length - 1), level: levels[Math.min(score, levels.length - 1)] };
}

// SSL check (demo, uses public API)
async function checkSSL(domain) {
  try {
    const res = await fetch(`https://api.sslytics.io/v1/ssl-check?domain=${encodeURIComponent(domain)}`, { mode: 'no-cors' });
    return { note: 'SSL check (demo) - use a proper API for production' };
  } catch {
    return { note: 'SSL check unavailable' };
  }
}

// IP lookup (demo)
async function lookupIP(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { mode: 'no-cors' });
    return { note: 'IP lookup (demo) - use a proper API for production' };
  } catch {
    return { note: 'IP lookup unavailable' };
  }
}