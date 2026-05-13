const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const FIELD_LIMITS = {
  company: 20,
  department: 80,
  members: 160,
  title: 120,
  dimension: 20,
  analysisType: 40,
  idea: 4000
};

const DEFAULT_TIMEOUT_MS = 25000;
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers || {})
    }
  });
}

function cleanText(value = '') {
  return String(value)
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function requireText(value, fallback = '') {
  const text = cleanText(value);
  return text || fallback;
}

function limitText(value, key) {
  const text = cleanText(value);
  const limit = FIELD_LIMITS[key];
  return limit && text.length > limit ? text.slice(0, limit) : text;
}

function getNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(number)));
}

function isAllowedOrigin(request, env) {
  const allowed = cleanText(env.ALLOWED_ORIGIN);
  if (!allowed) return true;

  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const allowedOrigins = allowed.split(',').map(item => item.trim()).filter(Boolean);
  if (origin && allowedOrigins.includes(origin)) return true;

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return allowedOrigins.includes(refererOrigin);
    } catch {
      return false;
    }
  }

  return false;
}

function buildPrompt(form) {
  return `
你是台灣保險業內部創新提案顧問。請根據使用者資料，產出可直接貼入 IDEA Box 提案書的繁體中文內容。

重要格式規則：
1. 只輸出 JSON，不要 Markdown，不要使用 ##、**、反引號或 Markdown 表格。
2. 所有欄位請用純文字。可以用換行分段，也可以使用「【標題】」和「1.」編號，但不要用 Markdown 語法。
3. 內容要具體、正式、可落地，避免空泛口號。
4. 預期效益要包含量化與質化指標。
5. 可行性要包含短期 1 年內的階段、合作部門與配合事項。
6. analysisRows 必須依決策分析方式產生表格資料：
   可行性分析：評估技術、組織、時程、擴充性。
   成本效益分析：比較投入成本、營運成本、量化效益、質化效益。
   風險與因應分析：列出資料、品質、導入、維運風險與因應措施。
   5W1H分析：整理 Why、What、Who、When、Where、How。
   KPI指標分析：列出效率、品質、使用、體驗、治理指標。
   使用者旅程分析：依需求提出、資料整理、審核確認、執行追蹤分析痛點與 AI 輔助機會。

使用者資料：
提案單位：${form.company}
部門名稱：${form.department}
團隊成員：${form.members}
提案名稱：${form.title}
應用構面：${form.dimension}
決策分析方式：${form.analysisType}
構想說明：
${form.idea}

請回傳 JSON 欄位：
analysisRows: 二維陣列，第一列為表頭，依「${form.analysisType}」整理決策分析。
purpose: 提案目的。
description: 提案說明。
aiApplication: AI 輔助應用說明。
expectedBenefits: 預期效益、成效、商業模式或核心價值。
feasibility: 可行性與時程。
cooperatingDepartment: 建議配合部門。
cooperationDetails: 配合事項。
`;
}

function extractJson(text = '') {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  return match ? match[0] : trimmed;
}

function normalizeForm(body = {}) {
  return {
    company: requireText(limitText(body.company, 'company'), '台灣人壽'),
    department: requireText(limitText(body.department, 'department'), '未填寫'),
    members: requireText(limitText(body.members, 'members'), '未填寫'),
    title: requireText(limitText(body.title, 'title')),
    dimension: requireText(limitText(body.dimension, 'dimension'), '流程優化'),
    analysisType: requireText(limitText(body.analysisType, 'analysisType'), '可行性分析'),
    idea: requireText(limitText(body.idea, 'idea'))
  };
}

function normalizeGenerated(data = {}) {
  const rows = Array.isArray(data.analysisRows)
    ? data.analysisRows
        .filter(row => Array.isArray(row) && row.length)
        .map(row => row.map(cell => cleanText(cell)))
    : [];

  return {
    analysisRows: rows.length > 1 ? rows : undefined,
    purpose: cleanText(data.purpose),
    description: cleanText(data.description),
    aiApplication: cleanText(data.aiApplication),
    expectedBenefits: cleanText(data.expectedBenefits),
    feasibility: cleanText(data.feasibility),
    cooperatingDepartment: cleanText(data.cooperatingDepartment),
    cooperationDetails: cleanText(data.cooperationDetails)
  };
}

async function callGemini(form, env) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'Cloudflare Secret GEMINI_API_KEY 尚未設定' }, { status: 500 });
  }

  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const maxOutputTokens = getNumber(env.GEMINI_MAX_OUTPUT_TOKENS, DEFAULT_MAX_OUTPUT_TOKENS, 1024, 8192);
  const timeoutMs = getNumber(env.GEMINI_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 5000, 60000);
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort('Gemini API timeout'), timeoutMs);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let geminiResponse;
  try {
    geminiResponse = await fetch(endpoint, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(form) }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              analysisRows: {
                type: 'ARRAY',
                items: {
                  type: 'ARRAY',
                  items: { type: 'STRING' }
                }
              },
              purpose: { type: 'STRING' },
              description: { type: 'STRING' },
              aiApplication: { type: 'STRING' },
              expectedBenefits: { type: 'STRING' },
              feasibility: { type: 'STRING' },
              cooperatingDepartment: { type: 'STRING' },
              cooperationDetails: { type: 'STRING' }
            },
            required: [
              'analysisRows',
              'purpose',
              'description',
              'aiApplication',
              'expectedBenefits',
              'feasibility',
              'cooperatingDepartment',
              'cooperationDetails'
            ]
          }
        }
      })
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return jsonResponse({ error: 'Gemini API 回應逾時，請稍後再試' }, { status: 504 });
    }
    return jsonResponse({ error: 'Gemini API 連線失敗' }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await geminiResponse.json().catch(() => ({}));
  if (!geminiResponse.ok) {
    const message = payload.error?.message || 'Gemini API 呼叫失敗';
    return jsonResponse({ error: message }, { status: geminiResponse.status });
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim();

  if (!text) {
    return jsonResponse({ error: 'Gemini API 未回傳內容' }, { status: 502 });
  }

  try {
    return jsonResponse(normalizeGenerated(JSON.parse(extractJson(text))));
  } catch {
    return jsonResponse({ error: 'Gemini API 回傳內容不是有效 JSON' }, { status: 502 });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: JSON_HEADERS });
}

export async function onRequestPost(context) {
  try {
    if (!isAllowedOrigin(context.request, context.env)) {
      return jsonResponse({ error: '來源網域不允許使用此 API' }, { status: 403 });
    }

    const contentLength = Number(context.request.headers.get('Content-Length') || 0);
    if (contentLength > 12000) {
      return jsonResponse({ error: '輸入內容過長' }, { status: 413 });
    }

    const body = await context.request.json();
    const form = normalizeForm(body);
    if (!form.title || !form.idea) {
      return jsonResponse({ error: '請至少填寫提案名稱與構想說明' }, { status: 400 });
    }
    return await callGemini(form, context.env);
  } catch (error) {
    return jsonResponse({ error: error.message || '伺服器發生錯誤' }, { status: 500 });
  }
}
