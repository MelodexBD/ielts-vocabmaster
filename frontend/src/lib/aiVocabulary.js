import { auth } from './firebase';

// Address of the Cloudflare Worker that asks Gemini (backend/ai-worker). It is not a secret: the
// worker only answers the logged-in admin. Without it the generator uses the free online dictionaries.
export const AI_WORKER_URL = (import.meta.env.VITE_AI_WORKER_URL || '').trim();
export const AI_BATCH_SIZE = 20;

const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);
const strings = list => (Array.isArray(list) ? list.filter(item => typeof item === 'string') : []);
const padExamples = list => [...strings(list).map(item => item.trim()), '', '', '', ''].slice(0, 4);

function labels(list) {
  return (Array.isArray(list) ? list : [])
    .filter(item => item && typeof item.word === 'string' && item.word.trim())
    .slice(0, 4)
    .map(item => (item.bangla ? `${capitalize(item.word.trim())} + ${String(item.bangla).trim()}` : capitalize(item.word.trim())));
}

// Asks the AI worker about up to AI_BATCH_SIZE words. Returns a map from the lower-case word to
// the preview fields (same shape the bulk vocabulary form uses).
export async function generateWithAI(words) {
  const user = auth.currentUser;
  if (!user) throw new Error('Log in with the admin account first.');
  const response = await fetch(AI_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ words })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `AI request failed (${response.status}).`);

  const result = new Map();
  (Array.isArray(data.words) ? data.words : []).forEach(item => {
    if (!item || typeof item.word !== 'string' || typeof item.meaning !== 'string' || !item.meaning.trim()) return;
    const synonyms = labels(item.synonyms);
    const antonyms = labels(item.antonyms);
    result.set(item.word.trim().toLowerCase(), {
      meaning: item.meaning.trim(),
      partOfSpeech: typeof item.partOfSpeech === 'string' ? item.partOfSpeech.trim() : '',
      synonyms,
      antonyms,
      synonymExamples: padExamples(strings(item.synonymExamples).slice(0, synonyms.length)),
      antonymExamples: padExamples(strings(item.antonymExamples).slice(0, antonyms.length)),
      example: typeof item.example === 'string' ? item.example.trim() : ''
    });
  });
  return result;
}
