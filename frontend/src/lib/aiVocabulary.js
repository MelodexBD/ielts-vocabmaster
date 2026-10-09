import { auth } from './firebase';
import { examplePair } from './vocabItems';

// Address of the Cloudflare Worker that asks Gemini (backend/ai-worker). It is not a secret: the
// worker only answers the logged-in admin. Without it the generator uses the free online dictionaries.
// On Cloudflare the site and the worker share one address, so /api/vocabulary is used by default.
export const AI_WORKER_URL = (import.meta.env.VITE_AI_WORKER_URL || (import.meta.env.BASE_URL === '/' ? '/api/vocabulary' : '')).trim();
export const AI_BATCH_SIZE = 20;

const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);

// Synonyms/antonyms as stored on the site: { text: 'Word + বাংলা', examples: [two sentences] }.
function items(list) {
  return (Array.isArray(list) ? list : [])
    .filter(item => item && typeof item.word === 'string' && item.word.trim())
    .slice(0, 4)
    .map(item => ({
      text: item.bangla ? `${capitalize(item.word.trim())} + ${String(item.bangla).trim()}` : capitalize(item.word.trim()),
      examples: examplePair(item.examples)
    }));
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
    result.set(item.word.trim().toLowerCase(), {
      meaning: item.meaning.trim(),
      partOfSpeech: typeof item.partOfSpeech === 'string' ? item.partOfSpeech.trim() : '',
      examples: examplePair(item.examples),
      synonyms: items(item.synonyms),
      antonyms: items(item.antonyms)
    });
  });
  return result;
}
