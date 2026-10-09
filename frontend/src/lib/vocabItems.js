// A synonym or antonym is stored as { text: 'Careful + সতর্ক', examples: ['…', '…'] }.
// Older words store a plain string (and their examples separately in synonymExamples/antonymExamples).
export const EXAMPLES_PER_ITEM = 2;

export const itemText = item => (typeof item === 'string' ? item : typeof item?.text === 'string' ? item.text : '');

export const cleanExamples = list => (Array.isArray(list) ? list : [])
  .filter(example => typeof example === 'string' && example.trim())
  .map(example => example.trim());

export const itemExamples = item => (typeof item === 'string' ? [] : cleanExamples(item?.examples));

// Exactly two example slots, for the admin's edit form.
export const examplePair = list => [...cleanExamples(list), '', ''].slice(0, EXAMPLES_PER_ITEM);
