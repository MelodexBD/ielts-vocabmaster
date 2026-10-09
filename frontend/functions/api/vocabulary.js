// Cloudflare Pages Function for /api/vocabulary: runs the same admin-only Gemini code as the Worker
// (backend/ai-worker/worker.js). The GEMINI_API_KEY secret is set in the Pages project's settings.
import worker from '../../../backend/ai-worker/worker.js';

export const onRequest = context => worker.fetch(context.request, context.env);
