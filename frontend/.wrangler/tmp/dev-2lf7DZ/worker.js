var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../backend/ai-worker/worker.js
var FIREBASE_PROJECT_ID = "ielts-vocab-master-c1a7a";
var ADMIN_EMAIL = "ieltsvocabmaster@gmail.com";
var ALLOWED_ORIGINS = ["https://melodexbd.github.io", "http://localhost:4173", "http://localhost:5173"];
var GOOGLE_KEYS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
var DEFAULT_MODELS = ["gemini-flash-latest", "gemini-2.5-flash"];
var MAX_WORDS = 25;
var worker_default = {
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith("/api/") && env.ASSETS) return env.ASSETS.fetch(request);
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      Vary: "Origin"
    };
    const reply = /* @__PURE__ */ __name((body, status = 200) => new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" }
    }), "reply");
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return reply({ error: "Use POST." }, 405);
    if (!env.GEMINI_API_KEY) return reply({ error: "GEMINI_API_KEY secret is not set on the worker." }, 500);
    try {
      const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      await verifyAdminToken(token);
    } catch (error) {
      return reply({ error: `Not allowed: ${error.message}` }, 401);
    }
    let words;
    try {
      const body = await request.json();
      words = [...new Set((body.words || []).map((word) => String(word).trim()).filter((word) => /^[A-Za-z][A-Za-z' -]{0,40}$/.test(word)))];
    } catch {
      return reply({ error: 'Send JSON like {"words": ["resilient", "candid"]}.' }, 400);
    }
    if (!words.length) return reply({ error: "No valid English words were sent." }, 400);
    if (words.length > MAX_WORDS) return reply({ error: `Send at most ${MAX_WORDS} words per request.` }, 400);
    try {
      return reply({ words: await askGemini(words, env) });
    } catch (error) {
      return reply({ error: error.message }, 502);
    }
  }
};
function base64UrlToBytes(text) {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}
__name(base64UrlToBytes, "base64UrlToBytes");
var decodeJson = /* @__PURE__ */ __name((part) => JSON.parse(new TextDecoder().decode(base64UrlToBytes(part))), "decodeJson");
async function verifyAdminToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("missing login token");
  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeJson(headerPart);
  const payload = decodeJson(payloadPart);
  if (header.alg !== "RS256") throw new Error("unexpected token type");
  const keys = await fetch(GOOGLE_KEYS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } }).then((response) => response.json());
  const jwk = (keys.keys || []).find((key2) => key2.kid === header.kid);
  if (!jwk) throw new Error("unknown token key");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, base64UrlToBytes(signaturePart), new TextEncoder().encode(`${headerPart}.${payloadPart}`));
  if (!valid) throw new Error("invalid token signature");
  const now = Math.floor(Date.now() / 1e3);
  if (payload.aud !== FIREBASE_PROJECT_ID || payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) throw new Error("token is for another project");
  if (!(payload.exp > now) || payload.iat > now + 300) throw new Error("login token expired, refresh the admin page");
  if ((payload.email || "").toLowerCase() !== ADMIN_EMAIL || payload.email_verified !== true) throw new Error("only the verified admin account can use this");
}
__name(verifyAdminToken, "verifyAdminToken");
var PROMPT = `You are an expert IELTS teacher writing vocabulary flash cards for Bangladeshi students.
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
var ITEM_LIST = { type: "ARRAY", items: { type: "OBJECT", properties: { word: { type: "STRING" }, bangla: { type: "STRING" } }, required: ["word", "bangla"] } };
var RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      word: { type: "STRING" },
      partOfSpeech: { type: "STRING" },
      meaning: { type: "STRING" },
      synonyms: ITEM_LIST,
      antonyms: ITEM_LIST,
      synonymExamples: { type: "ARRAY", items: { type: "STRING" } },
      antonymExamples: { type: "ARRAY", items: { type: "STRING" } },
      example: { type: "STRING" }
    },
    required: ["word", "partOfSpeech", "meaning", "synonyms", "antonyms", "synonymExamples", "antonymExamples", "example"]
  }
};
async function askGemini(words, env) {
  const models = env.GEMINI_MODEL ? [env.GEMINI_MODEL] : DEFAULT_MODELS;
  let lastError = "Gemini did not answer.";
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: PROMPT + words.join("\n") }] }],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA }
      })
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 404) {
      lastError = data.error?.message || `Model ${model} was not found.`;
      continue;
    }
    if (response.status === 429) throw new Error("The free Gemini limit was reached for now. Wait a minute and try again.");
    if (!response.ok) throw new Error(data.error?.message || `Gemini error ${response.status}.`);
    const text = (data.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("");
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Gemini returned an unreadable answer. Please try again.");
    }
  }
  throw new Error(lastError);
}
__name(askGemini, "askGemini");

// ../../Users/sr122/AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../Users/sr122/AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-BkWFU0/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../Users/sr122/AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-BkWFU0/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
