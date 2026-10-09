// IELTS VocabMaster · Cloudflare Worker (free plan).
//
// Hosts the website (the built frontend/dist files, see frontend/wrangler.jsonc) and answers
// /api/vocabulary: the admin panel sends a list of English words, and this worker asks Google Gemini
// for the Bangla meaning, synonyms, antonyms and example sentences.
// The Gemini API key stays here as a secret (GEMINI_API_KEY), never in the website's code.
// Only the verified admin account can use it: every request must carry the admin's Firebase login token.
//
// Setup (Cloudflare dashboard, no software needed): see backend/ai-worker/README.md.

const FIREBASE_PROJECT_ID = 'ielts-vocab-master-c1a7a';
const ADMIN_EMAIL = 'ieltsvocabmaster@gmail.com';
const ALLOWED_ORIGINS = ['https://melodexbd.github.io', 'http://localhost:4173', 'http://localhost:5173'];
const GOOGLE_KEYS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const DEFAULT_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash'];
const MAX_WORDS = 25;

export default {
  async fetch(request, env) {
    // Everything except /api/ is the website itself (React handles its own routes).
    if (!new URL(request.url).pathname.startsWith('/api/') && env.ASSETS) return env.ASSETS.fetch(request);

    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      Vary: 'Origin'
    };
    const reply = (body, status = 200) => new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply({ error: 'Use POST.' }, 405);
    if (!env.GEMINI_API_KEY) return reply({ error: 'GEMINI_API_KEY secret is not set on the worker.' }, 500);

    try {
      const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
      await verifyAdminToken(token);
    } catch (error) {
      return reply({ error: `Not allowed: ${error.message}` }, 401);
    }

    let words;
    try {
      const body = await request.json();
      words = [...new Set((body.words || []).map(word => String(word).trim()).filter(word => /^[A-Za-z][A-Za-z' -]{0,40}$/.test(word)))];
    } catch {
      return reply({ error: 'Send JSON like {"words": ["resilient", "candid"]}.' }, 400);
    }
    if (!words.length) return reply({ error: 'No valid English words were sent.' }, 400);
    if (words.length > MAX_WORDS) return reply({ error: `Send at most ${MAX_WORDS} words per request.` }, 400);

    try {
      return reply({ words: await askGemini(words, env) });
    } catch (error) {
      return reply({ error: error.message }, 502);
    }
  }
};

// ---------------------------------------------------------------- Firebase login check

function base64UrlToBytes(text) {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0));
}

const decodeJson = part => JSON.parse(new TextDecoder().decode(base64UrlToBytes(part)));

// Checks the Firebase ID token's signature with Google's public keys, then that it belongs to the
// verified admin account of this project and has not expired.
async function verifyAdminToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('missing login token');
  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeJson(headerPart);
  const payload = decodeJson(payloadPart);
  if (header.alg !== 'RS256') throw new Error('unexpected token type');

  const keys = await fetch(GOOGLE_KEYS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } }).then(response => response.json());
  const jwk = (keys.keys || []).find(key => key.kid === header.kid);
  if (!jwk) throw new Error('unknown token key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, base64UrlToBytes(signaturePart), new TextEncoder().encode(`${headerPart}.${payloadPart}`));
  if (!valid) throw new Error('invalid token signature');

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== FIREBASE_PROJECT_ID || payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) throw new Error('token is for another project');
  if (!(payload.exp > now) || payload.iat > now + 300) throw new Error('login token expired, refresh the admin page');
  if ((payload.email || '').toLowerCase() !== ADMIN_EMAIL || payload.email_verified !== true) throw new Error('only the verified admin account can use this');
}

// ---------------------------------------------------------------- Gemini

const PROMPT = `You are an expert IELTS teacher writing vocabulary flash cards for Bangladeshi students.
For each English word below, return:
- "word": the word exactly as given.
- "partOfSpeech": its most common part of speech in IELTS texts (e.g. "adjective").
- "meaning": its Bangla meaning in that sense, natural everyday Bangla (not a transliteration). Give one or two meanings separated by " / ".
- "synonyms": up to 4 single-word synonyms with the SAME meaning and part of speech, most useful for IELTS first. Each has "word" (English) and "bangla" (its Bangla meaning in this sense).
- "antonyms": up to 4 single-word antonyms (true opposites in this sense), each with "word" and "bangla". Give at least one whenever a sensible opposite exists.
- "synonymExamples": one natural IELTS-level English sentence for each synonym, in the same order, using that synonym.
- "antonymExamples": one natural IELTS-level English sentence for each antonym, in the same order, using that antonym.
- "example": one natural IELTS-level English sentence using the word itself.
Use correct Bangla spelling. Return the words in the same order as given.

Words:
`;

const ITEM_LIST = { type: 'ARRAY', items: { type: 'OBJECT', properties: { word: { type: 'STRING' }, bangla: { type: 'STRING' } }, required: ['word', 'bangla'] } };
const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      word: { type: 'STRING' },
      partOfSpeech: { type: 'STRING' },
      meaning: { type: 'STRING' },
      synonyms: ITEM_LIST,
      antonyms: ITEM_LIST,
      synonymExamples: { type: 'ARRAY', items: { type: 'STRING' } },
      antonymExamples: { type: 'ARRAY', items: { type: 'STRING' } },
      example: { type: 'STRING' }
    },
    required: ['word', 'partOfSpeech', 'meaning', 'synonyms', 'antonyms', 'synonymExamples', 'antonymExamples', 'example']
  }
};

async function askGemini(words, env) {
  const models = env.GEMINI_MODEL ? [env.GEMINI_MODEL] : DEFAULT_MODELS;
  let lastError = 'Gemini did not answer.';
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: PROMPT + words.join('\n') }] }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA }
      })
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 404) {
      // This model name is not available (renamed or retired): try the next one.
      lastError = data.error?.message || `Model ${model} was not found.`;
      continue;
    }
    if (response.status === 429) throw new Error('The free Gemini limit was reached for now. Wait a minute and try again.');
    if (!response.ok) throw new Error(data.error?.message || `Gemini error ${response.status}.`);
    const text = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || '').join('');
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Gemini returned an unreadable answer. Please try again.');
    }
  }
  throw new Error(lastError);
}
