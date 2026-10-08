import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { ADMIN_EMAIL, TESTS, autoDict } from '../lib/data';
import {
  addBanner, addContent, deleteBanner, saveBookRange, saveModuleSections
} from '../lib/firebase';

const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80';
const SMALL_INPUT = 'mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-forest-500';
const FORM_INPUT = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm';
const FORM_TEXTAREA = 'mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm';
const SAVE_BUTTON = 'rounded-xl bg-forest-600 px-5 py-3 text-xs font-extrabold text-white hover:bg-forest-700 disabled:cursor-wait disabled:opacity-70';

function cloudErrorMessage(prefix, error) {
  if (error && error.code === 'permission-denied') return `${prefix} Permission denied: make sure you are logged in with the admin account and your email is verified.`;
  return `${prefix} Please check your internet connection and try again.`;
}

// A Firestore document holds at most 1 MB, so banner images are resized and saved as JPEG.
function compressBannerImage(dataUrl) {
  const MAX_WIDTH = 1400;
  const MAX_LENGTH = 700 * 1024;
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error('Could not read the image. Please try another file.'));
    image.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      for (let quality = 0.85; quality >= 0.4; quality -= 0.15) {
        const result = canvas.toDataURL('image/jpeg', quality);
        if (result.length <= MAX_LENGTH) return resolve(result);
      }
      reject(new Error('The image is too large. Please use a smaller or lower-resolution image.'));
    };
    image.src = dataUrl;
  });
}

// ---------------------------------------------------------------- Slider banners

function BannersTab() {
  const { raw, updateData } = useSiteData();
  const [image, setImage] = useState(DEFAULT_BANNER_IMAGE);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tag: '', title: '', desc: '', features: '' });
  const fileInput = useRef(null);
  const banners = raw.banners || [];

  const processFile = file => {
    if (!file.type.startsWith('image/')) {
      window.notify('Please choose an image file.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      window.notify('The image must be smaller than 15 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => window.notify('Could not read the image. Please try another file.');
    reader.onload = async event => {
      try {
        setImage(await compressBannerImage(event.target.result));
        setFileName(file.name);
      } catch (error) {
        console.error('Banner image could not be compressed.', error);
        window.notify(error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = async event => {
    event.preventDefault();
    const features = form.features.trim();
    setSaving(true);
    try {
      const saved = await addBanner({
        tag: form.tag.trim(),
        image,
        title: form.title.trim(),
        desc: form.desc.trim(),
        features: features ? features.split(',').map(item => item.trim()).filter(Boolean) : ['Book tests', 'Full solutions']
      });
      updateData(current => ({ banners: [saved, ...(current.banners || [])] }));
      setForm({ tag: '', title: '', desc: '', features: '' });
      setImage(DEFAULT_BANNER_IMAGE);
      setFileName('');
      if (fileInput.current) fileInput.current.value = '';
      window.notify('Slider banner uploaded successfully!', 'success');
    } catch (error) {
      console.error('Banner could not be saved.', error);
      window.notify(cloudErrorMessage('Could not save the banner.', error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async banner => {
    if (!banner.id) {
      window.notify('Banner not found. Refresh the page and try again.');
      return;
    }
    try {
      await deleteBanner(banner.id);
      updateData(current => ({ banners: (current.banners || []).filter(item => item.id !== banner.id) }));
    } catch (error) {
      console.error('Banner could not be deleted.', error);
      window.notify(cloudErrorMessage('Could not delete the banner.', error));
    }
  };

  const field = name => ({ value: form[name], onChange: event => setForm(current => ({ ...current, [name]: event.target.value })) });

  return (
    <section className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm md:p-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-800"><i className="fa-solid fa-cloud-arrow-up text-forest-600"></i> Create a slider banner</h2>
          <p className="mt-1 text-xs text-slate-500">Add an image, title and features together. Banners appear in the live site's slider.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div
            onClick={event => { if (!event.target.closest('button') && event.target !== fileInput.current) fileInput.current?.click(); }}
            onDragEnter={event => { event.preventDefault(); setDragging(true); }}
            onDragOver={event => { event.preventDefault(); setDragging(true); }}
            onDragLeave={event => { event.preventDefault(); setDragging(false); }}
            onDrop={event => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files[0]) processFile(event.dataTransfer.files[0]); }}
            className={`flex cursor-pointer flex-col items-center justify-center space-y-2 rounded-2xl border-2 border-dashed p-6 text-center transition-all hover:border-forest-600 md:p-8 ${dragging ? 'border-forest-600 bg-forest-50' : 'border-slate-300 bg-slate-50'}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-100 text-forest-700"><i className="fa-solid fa-image text-xl"></i></div>
            <p className="text-xs font-bold text-slate-700">Drag an image here or choose one from your device</p>
            <p className="text-[10px] text-slate-400">PNG, JPG, WEBP · smaller images save faster</p>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={event => event.target.files[0] && processFile(event.target.files[0])} />
            <button type="button" onClick={() => fileInput.current?.click()} className="rounded-xl border border-forest-200 bg-white px-4 py-2 text-xs font-bold text-forest-700 hover:bg-forest-50">Choose image</button>
            {fileName && (
              <div className="mt-3 w-full max-w-lg">
                <img src={image} alt="Banner image preview" className="h-40 w-full rounded-xl border border-slate-200 object-cover shadow-sm" />
                <p className="mt-1 text-[10px] text-slate-500">{fileName}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block text-xs font-bold text-slate-700">Short top tag
              <input type="text" required placeholder="e.g. BAND 8.0 STRATEGY" className={SMALL_INPUT} {...field('tag')} />
            </label>
            <label className="block text-xs font-bold text-slate-700">Banner title
              <input type="text" required placeholder="Latest tricks for IELTS books" className={SMALL_INPUT} {...field('title')} />
            </label>
          </div>
          <label className="block text-xs font-bold text-slate-700">Short description
            <textarea rows={2} required placeholder="Write a short description for the banner..." className={SMALL_INPUT} {...field('desc')}></textarea>
          </label>
          <label className="block text-xs font-bold text-slate-700">Features (separate with commas)
            <input type="text" placeholder="40 tests, full Bangla meanings, Band 8.0 solutions" className={SMALL_INPUT} {...field('features')} />
          </label>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-forest-600 px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-forest-700 disabled:cursor-wait disabled:opacity-70">
            <i className={`fa-solid ${saving ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'}`}></i> {saving ? 'Publishing...' : 'Publish banner'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Banners currently in the slider</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {banners.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500 md:col-span-3">No banners have been added yet.</p>
          )}
          {banners.map(banner => (
            <article key={banner.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img src={banner.image} alt={banner.title} className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase text-forest-600">{banner.tag}</p>
                <h4 className="mt-1 line-clamp-2 text-sm font-bold text-slate-800">{banner.title}</h4>
                <button type="button" onClick={() => remove(banner)} className="mt-3 w-full rounded-lg bg-rose-50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100">Delete banner</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Module content

function BulkVocabulary({ book, test }) {
  const { updateData } = useSiteData();
  const [input, setInput] = useState('');
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);
  const words = input.split(/[,\n]+/).map(word => word.trim()).filter(Boolean);

  const generate = () => {
    if (!words.length) {
      window.notify('Enter one or more English words.');
      return;
    }
    if (words.length > 200) {
      window.notify('You can preview at most 200 words at a time.');
      return;
    }
    setRecords(words.map(word => {
      const data = autoDict[word.toLowerCase()];
      return {
        module: 'Reading',
        word,
        meaning: data ? data.meaning : '',
        synonyms: data ? [...data.synonyms] : [],
        antonyms: data ? [...data.antonyms] : [],
        synonymExamples: ['', '', '', ''],
        antonymExamples: ['', '', '', ''],
        partOfSpeech: '',
        example: '',
        needsReview: !data,
        edited: false
      };
    }));
  };

  const update = (index, changes) => setRecords(current => current.map((record, i) => (i === index ? { ...record, ...changes } : record)));
  const updateExample = (index, field, exampleIndex, value) => setRecords(current => current.map((record, i) => {
    if (i !== index) return record;
    const examples = [...record[field]];
    examples[exampleIndex] = value;
    return { ...record, [field]: examples };
  }));

  const publish = async () => {
    const incomplete = records.find(record => !record.meaning.trim());
    if (incomplete) {
      window.notify(`“${incomplete.word}” needs a Bangla meaning. Add it, then publish all.`);
      return;
    }
    if (!book || !TESTS.includes(test)) {
      window.notify('Choose a book and a T1–T4 test before publishing.');
      return;
    }
    const toSave = records.map(({ needsReview, edited, ...record }) => ({ ...record, book, test }));
    setSaving(true);
    try {
      const saved = await addContent(toSave);
      updateData(current => ({ content: [...saved, ...(current.content || [])] }));
      window.notify(`${toSave.length} Reading words published to Book ${book.replace('Cambridge ', '')} · ${test}.`, 'success');
      setRecords([]);
      setInput('');
    } catch (error) {
      console.error('Reading vocabulary could not be saved.', error);
      window.notify(cloudErrorMessage('Could not save the words.', error));
    } finally {
      setSaving(false);
    }
  };

  const small = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs';

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
      <div>
        <h3 className="font-extrabold text-slate-800">Reading · Bulk vocabulary</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">Enter up to 200 words, separated by commas or new lines. In the preview, edit the Bangla meaning, synonyms, antonyms and four examples for each, then publish. This is not an AI generator.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <textarea value={input} onChange={event => setInput(event.target.value)} rows={9} placeholder={'Diligent, Benevolent, Candid\nEnter up to 200 words, one per line or separated by commas...'} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-forest-500"></textarea>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-500">{words.length} words{words.length > 200 ? ' · max 200' : ''}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setInput('Diligent, Benevolent, Candid, Resilient, Tenacious')} className="rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-xs font-bold text-forest-700">Demo words</button>
              <button type="button" onClick={generate} className="rounded-xl bg-forest-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-forest-700"><i className="fa-solid fa-wand-magic-sparkles mr-1"></i>Generate Vocabulary</button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div><h4 className="text-sm font-extrabold text-slate-800">Word preview</h4><p className="text-[11px] text-slate-500">{records.length} records · all fields editable</p></div>
            {records.length > 0 && (
              <button type="button" onClick={publish} disabled={saving} className="rounded-xl bg-forest-600 px-3 py-2 text-[11px] font-extrabold text-white hover:bg-forest-700 disabled:cursor-wait disabled:opacity-70">{saving ? 'Publishing...' : 'Publish all'}</button>
            )}
          </div>
          <div className="mt-3 max-h-[28rem] space-y-3 overflow-y-auto pr-1 text-center text-xs text-slate-500">
            {records.length === 0 && <p className="py-8">Enter words to create a preview.</p>}
            {records.map((record, index) => (
              <article key={`${record.word}-${index}`} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-left">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(9rem,0.7fr)_minmax(0,2fr)]">
                  <div className="space-y-2 rounded-xl bg-forest-50/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-sm text-forest-700">{record.word}</strong>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${record.needsReview ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {record.needsReview ? 'Add meaning' : record.edited && !autoDict[record.word.toLowerCase()] ? 'Edited' : 'From dictionary'}
                      </span>
                    </div>
                    <label className="block text-[10px] font-bold text-slate-500">Bangla meaning
                      <input value={record.meaning} onChange={event => update(index, { meaning: event.target.value, needsReview: !event.target.value.trim(), edited: true })} className={small} placeholder="Bangla meaning of the word" />
                    </label>
                    <label className="block text-[10px] font-bold text-slate-500">Part of speech
                      <input value={record.partOfSpeech} onChange={event => update(index, { partOfSpeech: event.target.value })} className={small} placeholder="Optional" />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[['synonyms', 'synonymExamples', 'Synonym', 'Enter synonyms separated by commas', 'border-forest-100 bg-forest-50/40', 'text-forest-700'],
                      ['antonyms', 'antonymExamples', 'Antonym', 'Enter antonyms separated by commas', 'border-slate-200 bg-slate-50', 'text-slate-600']]
                      .map(([listField, examplesField, label, placeholder, boxClass, labelClass]) => (
                        <div key={listField} className={`space-y-2 rounded-xl border p-3 ${boxClass}`}>
                          <label className={`block text-[10px] font-extrabold ${labelClass}`}>{label}
                            <input value={record[listField].join(', ')} onChange={event => update(index, { [listField]: event.target.value.split(',').map(value => value.trim()).filter(Boolean) })} className={small} placeholder={placeholder} />
                          </label>
                          <p className="text-[10px] font-bold text-slate-500">Example sentences (max 4)</p>
                          {record[examplesField].map((example, exampleIndex) => (
                            <input key={exampleIndex} value={example} onChange={event => updateExample(index, examplesField, exampleIndex, event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px]" placeholder={`${exampleIndex + 1}. Example sentence`} />
                          ))}
                        </div>
                      ))}
                  </div>
                  <label className="block text-[10px] font-bold text-slate-500 md:col-start-2">Example for this word
                    <input value={record.example} onChange={event => update(index, { example: event.target.value })} className={small} placeholder="Optional example sentence" />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const MODULE_FORMS = {
  Listening: {
    heading: 'Listening · Audio & question set',
    intro: 'Save the audio link, instructions, transcript and questions with answers.',
    fields: [
      { name: 'title', label: 'Set title', required: true, placeholder: 'e.g. Section 1 · Campus registration' },
      { name: 'audioUrl', label: 'Audio URL / file reference', type: 'url', placeholder: 'https://...' },
      { name: 'transcript', label: 'Instructions & transcript', textarea: 4, placeholder: 'Write listening instructions or the transcript' },
      { name: 'questions', label: 'Questions & answers', textarea: 4, placeholder: 'Write the questions and correct answers' }
    ],
    preview: [
      { name: 'title', placeholder: 'The set title will appear here', className: 'text-sm font-bold text-forest-700' },
      { audio: true },
      { name: 'transcript', placeholder: 'The transcript / instructions will appear here', className: 'whitespace-pre-line text-xs leading-5 text-slate-600' },
      { name: 'questions', placeholder: 'Questions and answers will appear here', className: 'whitespace-pre-line text-xs leading-5 text-slate-600' }
    ]
  },
  Writing: {
    heading: 'Writing · Task prompt',
    intro: 'Add the task type, question, model answer or examiner notes.',
    fields: [
      { name: 'taskType', label: 'Task type', options: ['Task 1 · Academic', 'Task 1 · General Training', 'Task 2'], pair: true },
      { name: 'title', label: 'Title / chart topic', required: true, placeholder: 'e.g. Changes in city transport', pair: true },
      { name: 'prompt', label: 'Question / Task prompt', textarea: 4, required: true },
      { name: 'modelAnswer', label: 'Model answer / planning notes', textarea: 6 }
    ],
    preview: [
      { name: 'taskType', placeholder: 'Task type', className: 'text-[11px] font-bold text-forest-700' },
      { name: 'title', placeholder: 'Title / chart topic', className: 'text-sm font-bold text-slate-800' },
      { name: 'prompt', placeholder: 'The task prompt will appear here', className: 'whitespace-pre-line text-xs leading-5 text-slate-600' },
      { name: 'modelAnswer', placeholder: 'The model answer / planning notes will appear here', className: 'whitespace-pre-line text-xs leading-5 text-slate-600' }
    ]
  },
  Speaking: {
    heading: 'Speaking · Cue card',
    intro: 'Note the cue-card topic, bullet points, model response and vocabulary.',
    fields: [
      { name: 'title', label: 'Cue-card topic', required: true, placeholder: 'Describe a place you enjoy visiting' },
      { name: 'bulletPoints', label: 'Bullet points', textarea: 4, placeholder: 'What it is; when you go; who you go with; why you enjoy it' },
      { name: 'modelAnswer', label: 'Model answer / speaking notes', textarea: 5 },
      { name: 'vocabulary', label: 'Useful vocabulary', placeholder: 'tranquil, memorable, ...' }
    ],
    preview: [
      { name: 'title', placeholder: 'The cue-card topic will appear here', className: 'text-sm font-bold text-forest-700' },
      { name: 'bulletPoints', placeholder: 'Bullet points will appear here', className: 'whitespace-pre-line text-xs leading-5 text-slate-600' },
      { name: 'modelAnswer', placeholder: 'The model answer will appear here', className: 'whitespace-pre-line text-xs leading-5 text-slate-600' },
      { name: 'vocabulary', placeholder: 'Useful vocabulary will appear here', className: 'text-xs text-slate-600' }
    ]
  }
};

function emptyValues(module) {
  return Object.fromEntries(MODULE_FORMS[module].fields.map(field => [field.name, field.options ? field.options[0] : '']));
}

function safeAudioUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function FormField({ field, value, onChange }) {
  const common = { name: field.name, value, required: field.required, placeholder: field.placeholder, onChange: event => onChange(event.target.value) };
  return (
    <label className="block text-xs font-bold text-slate-700">{field.label}
      {field.options
        ? <select {...common} className={FORM_INPUT}>{field.options.map(option => <option key={option}>{option}</option>)}</select>
        : field.textarea
          ? <textarea {...common} rows={field.textarea} className={FORM_TEXTAREA}></textarea>
          : <input {...common} type={field.type || 'text'} className={FORM_INPUT} />}
    </label>
  );
}

function ModuleContentForm({ module, book, test }) {
  const { updateData } = useSiteData();
  const config = MODULE_FORMS[module];
  const [values, setValues] = useState(() => emptyValues(module));
  const [saving, setSaving] = useState(false);
  const set = name => value => setValues(current => ({ ...current, [name]: value }));
  const pairFields = config.fields.filter(field => field.pair);
  const otherFields = config.fields.filter(field => !field.pair);
  const audioUrl = safeAudioUrl(values.audioUrl);

  const submit = async event => {
    event.preventDefault();
    if (!book || !TESTS.includes(test)) {
      window.notify('Choose a book and a T1–T4 test.');
      return;
    }
    setSaving(true);
    try {
      const saved = await addContent([{ module, book, test, ...values, createdAt: new Date().toISOString() }]);
      updateData(current => ({ content: [...saved, ...(current.content || [])] }));
      setValues(emptyValues(module));
      window.notify(`${module} content saved to Book ${book.replace('Cambridge ', '')} · ${test}.`, 'success');
    } catch (error) {
      console.error(`${module} content could not be saved.`, error);
      window.notify(cloudErrorMessage('Could not save the content.', error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 md:p-5">
      <div className="md:col-span-2"><h3 className="font-extrabold text-slate-800">{config.heading}</h3><p className="mt-1 text-xs text-slate-500">{config.intro}</p></div>
      {pairFields.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pairFields.map(field => <FormField key={field.name} field={field} value={values[field.name]} onChange={set(field.name)} />)}
        </div>
      )}
      {otherFields.map(field => <FormField key={field.name} field={field} value={values[field.name]} onChange={set(field.name)} />)}
      <aside className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
        <h4 className="text-sm font-extrabold text-slate-800">{module} Preview</h4>
        {config.preview.map((item, index) => (item.audio
          ? audioUrl && <audio key={index} src={audioUrl} controls preload="none" className="w-full"></audio>
          : <p key={item.name} className={item.className}>{values[item.name]?.trim() || item.placeholder}</p>))}
      </aside>
      <button type="submit" disabled={saving} className={`${SAVE_BUTTON} md:col-span-2`}>{saving ? 'Saving...' : `Save ${module} content`}</button>
    </form>
  );
}

function ModulesTab() {
  const { bookRange } = useSiteData();
  const [book, setBook] = useState(`Cambridge ${bookRange.start}`);
  const [test, setTest] = useState('T1');
  const [module, setModule] = useState('Reading');
  const books = [];
  for (let number = bookRange.start; number <= bookRange.end; number++) books.push(`Cambridge ${number}`);

  // Keep the chosen book valid when the book range changes.
  useEffect(() => {
    if (!books.includes(book)) setBook(books[0]);
  }, [bookRange.start, bookRange.end]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <div className="space-y-5 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm md:p-6">
        <div className="space-y-5 border-b border-slate-100 pb-5">
          <div>
            <h2 className="flex items-center gap-2 text-base font-black text-slate-800"><i className="fa-solid fa-list-check text-forest-600"></i> Upload content by module</h2>
            <p className="mt-1 text-xs text-slate-500">A separate form for each module. Content is saved to the selected book and test.</p>
          </div>
          <div className="rounded-2xl border border-forest-100 bg-forest-50/60 p-4">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-forest-700">Step 1 · Content destination</p>
            <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold text-slate-700">Book
                <select value={book} onChange={event => setBook(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-forest-500">
                  {books.map(item => <option key={item} value={item}>{item.replace('Cambridge', 'Book')}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-700">Test (always 4)
                <select value={test} onChange={event => setTest(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-forest-500">
                  <option value="T1">Test 1 (Free)</option><option value="T2">Test 2 (Pro)</option><option value="T3">Test 3 (Pro)</option><option value="T4">Test 4 (Pro)</option>
                </select>
              </label>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Step 2 · Choose module</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Content module">
              {['Reading', 'Listening', 'Writing', 'Speaking'].map(name => (
                <button key={name} type="button" role="tab" aria-selected={module === name} onClick={() => setModule(name)} className={module === name ? 'rounded-xl border border-forest-600 bg-forest-600 px-3 py-2.5 text-xs font-extrabold text-white' : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-forest-50'}>{name}</button>
              ))}
            </div>
          </div>
        </div>
        {module === 'Reading'
          ? <BulkVocabulary book={book} test={test} />
          : <ModuleContentForm key={module} module={module} book={book} test={test} />}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Home sections

const SECTION_FORMS = [
  {
    module: 'Reading', icon: 'fa-book-open-reader', intro: 'Introduction to the passage, reading focus and vocabulary.', headline: 'e.g. Build confident reading skills',
    fields: [{ name: 'readingMaterial', label: 'Passage / reading focus', textarea: 4, placeholder: 'Describe the passage type, reading strategy or vocabulary focus' }]
  },
  {
    module: 'Listening', icon: 'fa-headphones', intro: 'Audio, transcript and listening focus for the Listening section.', headline: 'e.g. Train your listening skills',
    fields: [
      { name: 'audioUrl', label: 'Audio URL', type: 'url', placeholder: 'https://example.com/listening.mp3' },
      { name: 'listeningMaterial', label: 'Transcript / listening focus', textarea: 3, placeholder: 'Write the transcript, audio instructions or listening focus' }
    ]
  },
  {
    module: 'Writing', icon: 'fa-pen-to-square', intro: 'Introduction to the task type, writing prompt and model answer.', headline: 'e.g. Plan a clear IELTS response',
    fields: [
      { name: 'taskType', label: 'Task type', options: ['Task 1 · Academic', 'Task 1 · General Training', 'Task 2'], pair: true },
      { name: 'writingPrompt', label: 'Writing prompt', textarea: 2, placeholder: 'Question or task prompt', pair: true },
      { name: 'writingMaterial', label: 'Model answer / planning focus', textarea: 3, placeholder: 'Write a sample answer or planning focus' }
    ]
  },
  {
    module: 'Speaking', icon: 'fa-microphone-lines', intro: 'Introduction to the cue card, bullet points and speaking response.', headline: 'e.g. Speak with confidence',
    fields: [
      { name: 'cueCard', label: 'Cue-card topic', placeholder: 'e.g. Describe a memorable journey' },
      { name: 'speakingMaterial', label: 'Bullet points / model response', textarea: 4, placeholder: 'Write cue-card bullet points, response notes or useful vocabulary' }
    ]
  }
];

function SectionForm({ config }) {
  const { moduleSections, updateData } = useSiteData();
  const saved = moduleSections[config.module] || {};
  const initial = () => ({
    headline: typeof saved.headline === 'string' ? saved.headline : '',
    summary: typeof saved.summary === 'string' ? saved.summary : '',
    ...Object.fromEntries(config.fields.map(field => [field.name, typeof saved[field.name] === 'string' ? saved[field.name] : (field.options ? field.options[0] : '')]))
  });
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  // Fill the form once the saved sections arrive from Firestore.
  useEffect(() => {
    setValues(initial());
  }, [JSON.stringify(saved)]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = name => value => setValues(current => ({ ...current, [name]: value }));
  const pairFields = config.fields.filter(field => field.pair);
  const otherFields = config.fields.filter(field => !field.pair);

  const submit = async event => {
    event.preventDefault();
    const sections = { ...moduleSections, [config.module]: { ...values, module: config.module, updatedAt: new Date().toISOString() } };
    setSaving(true);
    try {
      await saveModuleSections(sections);
      updateData({ moduleSections: sections });
      window.notify(`${config.module} home section content saved. Refresh the live site to see it.`, 'success');
    } catch (error) {
      console.error(`${config.module} section content could not be saved.`, error);
      window.notify(cloudErrorMessage('Could not save the module section.', error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-forest-100 bg-forest-50/40 p-4">
      <div><h3 className="font-extrabold text-slate-800"><i className={`fa-solid ${config.icon} mr-2 text-forest-600`}></i>{config.module} section</h3><p className="mt-1 text-[11px] text-slate-500">{config.intro}</p></div>
      <label className="block text-xs font-bold text-slate-700">Section headline<input value={values.headline} onChange={event => set('headline')(event.target.value)} required maxLength={80} placeholder={config.headline} className={FORM_INPUT} /></label>
      <label className="block text-xs font-bold text-slate-700">Short introduction<textarea value={values.summary} onChange={event => set('summary')(event.target.value)} required rows={2} maxLength={240} placeholder={`Write a short introduction for the ${config.module} section`} className={FORM_TEXTAREA}></textarea></label>
      {pairFields.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pairFields.map(field => <FormField key={field.name} field={field} value={values[field.name]} onChange={set(field.name)} />)}
        </div>
      )}
      {otherFields.map(field => <FormField key={field.name} field={field} value={values[field.name]} onChange={set(field.name)} />)}
      <button type="submit" disabled={saving} className="rounded-xl bg-forest-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-forest-700 disabled:cursor-wait disabled:opacity-70">{saving ? 'Saving...' : `Save ${config.module} section`}</button>
    </form>
  );
}

function SectionsTab() {
  return (
    <section>
      <div className="space-y-5 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm md:p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-800"><i className="fa-solid fa-table-cells-large text-forest-600"></i> The four module sections on the home page</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">These are introductory sections outside the book tests. Each section has its own uploader; saved content appears on the home card and the related module page.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {SECTION_FORMS.map(config => <SectionForm key={config.module} config={config} />)}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Book range

function BookRangeSettings() {
  const { bookRange, updateData } = useSiteData();
  const [start, setStart] = useState(bookRange.start);
  const [end, setEnd] = useState(bookRange.end);
  const [feedback, setFeedback] = useState({ text: '', ok: true });

  useEffect(() => {
    setStart(bookRange.start);
    setEnd(bookRange.end);
  }, [bookRange.start, bookRange.end]);

  const save = async () => {
    const range = { start: Number(start), end: Number(end) };
    if (!Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start < 1 || range.end > 99 || range.start > range.end) {
      setFeedback({ ok: false, text: 'Enter a valid range: start and end must be between 1 and 99, and the end must be greater than or equal to the start.' });
      return;
    }
    try {
      await saveBookRange(range);
      updateData({ bookRange: range });
      setFeedback({ ok: true, text: `Book ${range.start}–${range.end} saved. Refresh the live site to see the new book list.` });
    } catch (error) {
      console.error('book range could not be saved.', error);
      setFeedback({ ok: false, text: cloudErrorMessage('Could not save the book range.', error) });
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-forest-600">Admin workspace</p>
        <h2 className="mt-1 text-lg font-black text-slate-900">Content & site management</h2>
        <p className="mt-1 text-xs text-slate-500">Set the book range first, then manage banners or module content.</p>
      </div>
      <div className="rounded-2xl border border-forest-100 bg-forest-50/70 p-4 md:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest-600 text-xs font-black text-white">1</span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">book range</h3>
            <p className="mt-0.5 text-xs leading-5 text-slate-600">Changes here also update the book list on the live site. Every book has Tests 1–4.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="block text-xs font-bold text-slate-700">Start number
            <input type="number" min="1" max="99" value={start} onChange={event => setStart(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          </label>
          <label className="block text-xs font-bold text-slate-700">End number
            <input type="number" min="1" max="99" value={end} onChange={event => setEnd(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          </label>
          <button type="button" onClick={save} className="rounded-xl bg-forest-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-forest-700">Save range</button>
        </div>
        {feedback.text && <p aria-live="polite" className={`mt-3 text-xs font-semibold ${feedback.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{feedback.text}</p>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Page

const TABS = [
  { id: 'banners', label: 'Slider Banners', icon: 'fa-images', Component: BannersTab },
  { id: 'modules', label: 'Module Content', icon: 'fa-layer-group', Component: ModulesTab },
  { id: 'sections', label: 'Home Section Upload', icon: 'fa-table-cells-large', Component: SectionsTab }
];

export default function Admin() {
  const { status, profile, isAdmin } = useAuth();
  const [tab, setTab] = useState('banners');

  useEffect(() => {
    document.title = 'Admin Dashboard - IELTS VocabMaster';
    return () => { document.title = 'IELTS Book Prep & Vocabulary Master'; };
  }, []);

  useEffect(() => {
    if (status === 'loading' || isAdmin) return;
    // Firestore rules enforce the real admin permission; this only keeps others off the page.
    window.notify(status === 'user' && profile && !profile.emailVerified && profile.email === ADMIN_EMAIL
      ? 'The admin email is not verified yet. Click the verification link in your email or sign in with Google.'
      : 'Unauthorized access! This page is reserved for the admin.');
  }, [status, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading') return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const ActiveTab = TABS.find(item => item.id === tab).Component;

  return (
    <div className="min-h-screen bg-[#f4f7f5]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 shadow-sm md:px-10">
        <div>
          <h1 className="text-base font-black text-slate-900">Admin <span className="text-forest-600">Control Center</span></h1>
          <p className="text-[11px] font-semibold text-slate-400">IELTS VocabMaster Platform</p>
        </div>
        <Link to="/" className="flex items-center gap-1.5 rounded-xl border border-forest-600 px-3.5 py-2 text-xs font-bold text-forest-700 hover:bg-forest-50">
          <i className="fa-solid fa-arrow-left text-[10px]"></i> View live site
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-5 p-4 md:p-8">
        <nav role="tablist" aria-label="Choose admin task" className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {TABS.map(item => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={tab === item.id ? 'flex items-center gap-2 rounded-xl bg-forest-600 px-4 py-2.5 text-xs font-extrabold text-white' : 'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50'}>
              <i className={`fa-solid ${item.icon}`}></i> {item.label}
            </button>
          ))}
        </nav>
        <ActiveTab />
        <BookRangeSettings />
      </main>
    </div>
  );
}
