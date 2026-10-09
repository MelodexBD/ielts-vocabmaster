import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { useUI } from '../context/UIContext';
import { MODULE_NAMES, TESTS } from '../lib/data';
import useBookAccess from '../lib/useBookAccess';
import useHideOnScroll from '../lib/useHideOnScroll';
import { cleanExamples, itemText } from '../lib/vocabItems';
import SpeakButton from '../components/SpeakButton';

// "Examples" label under the word; the sentences stay hidden until it is clicked.
function ExampleToggle({ examples, className = 'text-forest-600' }) {
  const [open, setOpen] = useState(false);
  if (!examples.length) return null;
  return (
    <div className="mt-1">
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className={`inline-flex items-center gap-1 rounded-md text-[10px] font-bold hover:underline ${className}`}>
        <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true"></i>
        Examples
      </button>
      {open && (
        <ol className="mt-1 list-inside list-decimal space-y-1 rounded-lg bg-white/80 px-2 py-1.5">
          {examples.map(example => <li key={example} className="text-[11px] leading-relaxed text-slate-600">{example}</li>)}
        </ol>
      )}
    </div>
  );
}

function WordList({ items }) {
  return (
    <ul className="list-inside list-disc space-y-1.5 text-slate-700">
      {items.length
        ? items.map((item, index) => <li key={`${itemText(item)}-${index}`} className="text-xs font-medium leading-relaxed text-slate-600">{itemText(item)}</li>)
        : <li className="text-[11px] text-slate-400">None</li>}
    </ul>
  );
}

function WordCard({ word }) {
  const synonyms = (Array.isArray(word.synonyms) ? word.synonyms : []).filter(itemText);
  const antonyms = (Array.isArray(word.antonyms) ? word.antonyms : []).filter(itemText);
  const wordExamples = cleanExamples(Array.isArray(word.examples) ? word.examples : [word.example]);
  return (
    <div className="space-y-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:rounded-3xl">
      <div className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-slate-800">
            <span className="font-black text-forest-600">{word.word}</span> — <span className="font-bold text-emerald-700">{word.meaning}</span>
          </h3>
          <SpeakButton word={word.word} />
        </div>
        <ExampleToggle examples={wordExamples} />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-0.5">
        <div className="rounded-xl border border-forest-100 bg-forest-50/50 p-3">
          <h4 className="mb-2 border-b border-forest-200 pb-1 text-xs font-bold uppercase tracking-wider text-forest-700">Synonym:</h4>
          <WordList items={synonyms} />
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <h4 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Antonym:</h4>
          <WordList items={antonyms} />
        </div>
      </div>
    </div>
  );
}

// Open tests can be selected; locked ones show the PRO crown and open the unlock prompt.
function TestButton({ test, selected, unlocked, onClick }) {
  const label = `Test ${test.slice(1)}`;
  const base = 'flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 text-xs font-bold transition-all sm:text-sm md:h-11 md:px-4';
  if (unlocked) {
    return (
      <button type="button" onClick={onClick} aria-pressed={selected} className={`${base} border ${selected ? 'border-forest-600 bg-forest-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-forest-50'}`}>
        <span>{label}</span>
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={`${label} (PRO)`} className={`${base} border border-transparent text-slate-500 hover:bg-amber-50`}>
      <i className="fa-solid fa-crown text-[9px] text-amber-500 md:text-[11px]"></i>
      <span>{label}</span>
    </button>
  );
}

export default function BookDetails() {
  const { module, bookNumber } = useParams();
  const number = Number(bookNumber);
  const navigate = useNavigate();
  const { status, isLoggedIn, isAdmin, completedTests, toggleTestCompletion } = useAuth();
  const { vocabulary, bookRange } = useSiteData();
  const { selection, setSelection } = useUI();
  const { canOpenBook, canOpenTest, showLockedPrompt } = useBookAccess();
  // Words are stored under "Cambridge N"; the site shows the book as "Book N".
  const book = `Cambridge ${number}`;
  const title = `Book ${number}`;
  const chosenTest = selection.book === book ? selection.test : 'T1';
  // A test that is no longer open (e.g. after logging out) falls back to the free Test 1.
  const test = canOpenTest(number, chosenTest) ? chosenTest : 'T1';
  const barHidden = useHideOnScroll();

  useEffect(() => {
    if (selection.book !== book) setSelection({ book, test: 'T1' });
  }, [book]); // eslint-disable-line react-hooks/exhaustive-deps

  const validBook = Number.isInteger(number) && number >= bookRange.start && number <= bookRange.end;
  if (!MODULE_NAMES.includes(module) || !validBook) return <Navigate to={`/books/${MODULE_NAMES.includes(module) ? module : ''}`} replace />;
  // Wait for the login state before deciding whether a locked book may be opened from a direct link.
  if (status === 'loading') return null;
  if (!canOpenBook(number)) return <Navigate to={`/books/${module}`} replace />;

  const selectTest = nextTest => {
    if (!canOpenTest(number, nextTest)) {
      showLockedPrompt();
      return;
    }
    setSelection({ book, test: nextTest });
  };

  const words = vocabulary.filter(item => item.book === book && item.test === test && (item.module === undefined || item.module === 'Reading'));
  const completed = completedTests(module).includes(test);

  return (
    <div className="flex w-full flex-col space-y-4 p-4 md:p-0">
      {/* Stays fixed right under the site header while the word list scrolls. On phones it is a slim,
          full-width bar (back button, book and the four tests on one line) so more words fit on screen.
          It slides away under the header while scrolling down and comes back on scrolling up. */}
      <div aria-hidden={barHidden || undefined} className={`sticky top-[var(--header-height,64px)] z-30 -mx-4 -mt-4 flex items-center gap-2 border-b border-slate-200/80 bg-white px-3 py-2 shadow-sm transition-[transform,opacity] duration-300 ease-out md:top-[calc(var(--header-height,64px)_+_8px)] md:mx-0 md:mt-0 md:justify-between md:gap-3 md:rounded-3xl md:border md:p-5 ${barHidden ? 'pointer-events-none -translate-y-[calc(100%+12px)] opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <button type="button" onClick={() => navigate(`/books/${module}`)} aria-label="Back to book list" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 md:h-10 md:w-10">
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
          <h2 className="whitespace-nowrap text-base font-black text-slate-800 md:text-xl">{title}</h2>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 md:justify-end md:gap-3">
          <span className="hidden shrink-0 text-xs font-bold text-slate-400 lg:inline">Choose a test:</span>
          <div className="grid w-full grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 md:max-w-xl md:gap-1.5">
            {TESTS.map(item => (
              <TestButton
                key={item}
                test={item}
                selected={item === test}
                unlocked={canOpenTest(number, item)}
                onClick={() => selectTest(item)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {words.length
          ? words.map((word, index) => <WordCard key={word.id || `${word.word}-${index}`} word={word} />)
          : (
            <div className="col-span-full my-4 space-y-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:rounded-3xl md:p-12">
              <i className="fa-solid fa-folder-open text-4xl text-slate-300"></i>
              <p className="text-sm font-bold text-slate-700">{title} (Test {test.slice(1)}): no words found</p>
              <p className="text-xs text-slate-400">Add new words from the admin panel.</p>
            </div>
          )}
      </div>

      {isLoggedIn && !isAdmin && (
        <div className="flex justify-end">
          <button type="button" onClick={() => toggleTestCompletion(module, test)} aria-pressed={completed} className="rounded-xl bg-forest-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-700">
            {completed ? '✓ Test completed: unmark' : 'Mark this test as completed'}
          </button>
        </div>
      )}
    </div>
  );
}
