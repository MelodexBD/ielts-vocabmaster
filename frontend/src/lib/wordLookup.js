// Fills in a vocabulary word for the admin's bulk generator from free online dictionaries:
// Google Translate's dictionary data (Bangla meanings, part of speech, synonyms, example sentences),
// Wiktionary (antonyms, extra synonyms) and Datamuse (antonyms Wiktionary does not list).
// Everything comes back as a draft that the admin reviews and edits before publishing.

import { EXAMPLES_PER_ITEM, examplePair } from './vocabItems';

const GOOGLE_URL = 'https://translate.googleapis.com/translate_a/single';
const WIKTIONARY_URL = 'https://en.wiktionary.org/api/rest_v1/page/html/';
const DATAMUSE_URL = 'https://api.datamuse.com/words';
const MAX_ITEMS = 4;

const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);
const stripTags = html => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const sentence = text => {
  const clean = capitalize(stripTags(text));
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
};
// Flash cards work best with single, plain words.
const isPlainWord = item => typeof item === 'string' && /^[A-Za-z]+$/.test(item);

function unique(list, exclude = '') {
  const seen = new Set([exclude.toLowerCase()]);
  return list.filter(item => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Lookup failed (${response.status})`);
  return response.json();
}

// Google's answer is a positional array: [0] translation, [1] dictionary meanings by part of speech,
// [11] synonym groups, [13] example sentences.
function googleLookup(word, parts) {
  // Lower case: a capitalised word is often treated as a name and comes back without examples.
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: 'bn', q: word.toLowerCase() });
  return getJson(`${GOOGLE_URL}?${params}&${parts.map(part => `dt=${part}`).join('&')}`);
}

const translationOf = data => (data?.[0] || []).map(segment => segment?.[0] || '').join('').trim();
const dictionaryGroups = data => (Array.isArray(data?.[1]) ? data[1] : []);

function examplesOf(data) {
  const list = Array.isArray(data?.[13]?.[0]) ? data[13][0] : [];
  return list.map(entry => entry?.[0]).filter(html => typeof html === 'string').map(sentence).slice(0, EXAMPLES_PER_ITEM);
}

// Bangla meanings for the given part of speech (or the first one listed).
function banglaTerms(data, partOfSpeech) {
  const groups = dictionaryGroups(data);
  const group = groups.find(item => item?.[0] === partOfSpeech) || groups[0];
  return (group?.[1] || []).filter(term => typeof term === 'string' && term.trim());
}

// Synonym groups marked with a label (archaic, informal, ...) are skipped.
function googleSynonyms(data) {
  const groups = data?.[11]?.[0]?.[1] || [];
  return groups.filter(group => !group?.[2]).flatMap(group => group?.[0] || []).filter(isPlainWord);
}

// Synonyms and antonyms from the English section of the word's Wiktionary page.
async function wiktionaryNyms(word) {
  try {
    const response = await fetch(`${WIKTIONARY_URL}${encodeURIComponent(word.toLowerCase())}`);
    if (!response.ok) return { synonyms: [], antonyms: [] };
    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    const english = page.getElementById('English')?.closest('section') || page.body;
    const words = selector => [...english.querySelectorAll(selector)]
      .map(link => link.textContent.trim())
      .filter(isPlainWord);
    return { synonyms: words('.nyms.synonym a'), antonyms: words('.nyms.antonym a') };
  } catch {
    return { synonyms: [], antonyms: [] };
  }
}

async function datamuseAntonyms(word) {
  try {
    const items = await getJson(`${DATAMUSE_URL}?rel_ant=${encodeURIComponent(word.toLowerCase())}&max=6`);
    return items.map(item => item.word).filter(isPlainWord);
  } catch {
    return [];
  }
}

// Datamuse knows few direct antonyms for less common words, so the opposites of the closest synonyms
// are used as well: prefixed forms first (careful → careless, precise → imprecise), then repeats.
async function datamuseFallback(word, synonyms) {
  const direct = await datamuseAntonyms(word);
  const results = await Promise.all(synonyms.slice(0, 6).map(async synonym => ({ synonym, antonyms: await datamuseAntonyms(synonym) })));
  const prefixed = [];
  const counts = new Map();
  results.forEach(({ synonym, antonyms }) => antonyms.forEach(antonym => {
    if (/^(un|in|im|il|ir|dis|non)/.test(antonym) && antonym.endsWith(synonym.slice(1))) prefixed.push(antonym);
    counts.set(antonym, (counts.get(antonym) || 0) + 1);
  }));
  const repeated = [...counts].filter(([, count]) => count > 1).map(([antonym]) => antonym);
  return [...direct, ...prefixed, ...repeated];
}

// Bangla meaning and two example sentences for a synonym or antonym.
async function describe(item, partOfSpeech) {
  try {
    const data = await googleLookup(item, ['t', 'bd', 'ex']);
    const bangla = banglaTerms(data, partOfSpeech)[0] || translationOf(data);
    return {
      text: bangla && bangla.toLowerCase() !== item.toLowerCase() ? `${capitalize(item)} + ${bangla}` : capitalize(item),
      examples: examplePair(examplesOf(data))
    };
  } catch {
    return { text: capitalize(item), examples: examplePair([]) };
  }
}

// Looks up one word. Returns null when no Bangla meaning could be found.
export async function lookupWord(word) {
  // Google leaves out example sentences when synonyms are requested too, so they are fetched separately.
  const [data, exampleData, wiki] = await Promise.all([
    googleLookup(word, ['t', 'bd', 'ss']),
    googleLookup(word, ['ex']).catch(() => null),
    wiktionaryNyms(word)
  ]);
  const partOfSpeech = dictionaryGroups(data)[0]?.[0] || data?.[11]?.[0]?.[0] || '';
  const terms = banglaTerms(data, partOfSpeech);
  const meaning = terms.length ? terms.slice(0, 2).join(' / ') : translationOf(data);
  if (!meaning || meaning.toLowerCase() === word.toLowerCase()) return null;

  const allSynonyms = unique([...googleSynonyms(data), ...wiki.synonyms], word);
  let antonyms = unique(wiki.antonyms, word);
  if (antonyms.length < 2) antonyms = unique([...antonyms, ...await datamuseFallback(word, allSynonyms)], word);
  const synonyms = allSynonyms.slice(0, MAX_ITEMS);
  antonyms = antonyms.filter(item => !allSynonyms.some(synonym => synonym.toLowerCase() === item.toLowerCase())).slice(0, MAX_ITEMS);

  const [synonymInfo, antonymInfo] = await Promise.all([
    Promise.all(synonyms.map(item => describe(item, partOfSpeech))),
    Promise.all(antonyms.map(item => describe(item, partOfSpeech)))
  ]);
  return {
    meaning,
    // Without dictionary meanings the translation may only be a transliteration, so it needs a check.
    meaningIsGuess: !terms.length,
    partOfSpeech,
    examples: examplePair(examplesOf(exampleData)),
    synonyms: synonymInfo,
    antonyms: antonymInfo
  };
}
