// Synonyms and antonyms are stored as 'Careful + সতর্ক'. A few words saved for a short while used
// { text, examples } objects instead; only their text is shown.
export const EXAMPLES_PER_ITEM = 2;

export const itemText = item => (typeof item === 'string' ? item : typeof item?.text === 'string' ? item.text : '');

export const cleanExamples = list => (Array.isArray(list) ? list : [])
  .filter(example => typeof example === 'string' && example.trim())
  .map(example => example.trim());

// Exactly two example slots for the word, for the admin's edit form.
export const examplePair = list => [...cleanExamples(list), '', ''].slice(0, EXAMPLES_PER_ITEM);
