import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { useUI } from '../context/UIContext';
import { MODULE_NAMES, TESTS } from '../lib/data';
import useBookAccess from '../lib/useBookAccess';

function WordList({ items }) {
  return (
    <ul className="list-inside list-disc space-y-1 text-slate-700">
      {items.length
        ? items.map(item => <li key={item} className="text-xs font-medium leading-relaxed text-slate-600">{item}</li>)
        : <li className="text-[11px] text-slate-400">None</li>}
    </ul>
  );
}

function Examples({ items, className }) {
  const examples = (Array.isArray(items) ? items : []).filter(Boolean);
  if (!examples.length) return null;
  return (
    <>
      <p className={`mt-2 border-t pt-2 text-[10px] font-bold ${className}`}>Examples</p>
      <ul className="mt-1 space-y-1">
        {examples.map(example => <li key={example} className="text-[11px] leading-relaxed text-slate-500">{example}</li>)}
      </ul>
    </>
  );
}

function WordCard({ word }) {
  const synonyms = Array.isArray(word.synonyms) ? word.synonyms : [];
  const antonyms = Array.isArray(word.antonyms) ? word.antonyms : [];
  return (
    <div className="space-y-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:rounded-3xl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-extrabold text-slate-800">
          Word: <span className="font-black text-forest-600">{word.word}</span> — <span className="font-bold text-emerald-700">{word.meaning}</span>
        </h3>
        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">FREE UNLOCKED</span>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-0.5">
        <div className="rounded-xl border border-forest-100 bg-forest-50/50 p-3">
          <h4 className="mb-2 border-b border-forest-200 pb-1 text-xs font-bold uppercase tracking-wider text-forest-700">Synonym:</h4>
          <WordList items={synonyms} />
          <Examples items={word.synonymExamples} className="border-forest-100 text-forest-700" />
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <h4 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Antonym:</h4>
          <WordList items={antonyms} />
          <Examples items={word.antonymExamples} className="border-slate-200 text-slate-600" />
        </div>
      </div>
    </div>
  );
}

function TestButton({ test, selected, unlocked, isFreeTest, onClick }) {
  const base = 'flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition-all md:py-1.5';
  if (unlocked && !isFreeTest) {
    return (
      <button type="button" onClick={onClick} className={`${base} border ${selected ? 'border-forest-600 bg-forest-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-forest-50'}`}>
        <span>{test}</span>
      </button>
    );
  }
  if (isFreeTest) {
    return (
      <button type="button" onClick={onClick} className={`${base} border border-forest-600 bg-forest-600 text-white`}>
        <span>{test}</span>
        <span className="rounded bg-white/20 px-1 text-[9px]">FREE</span>
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${base} text-slate-500 hover:bg-slate-200`}>
      <i className="fa-solid fa-lock text-[10px] text-amber-500"></i>
      <span>{test}</span>
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
  const { canOpenBook, canOpenTest, showLockedPrompt, hasFullAccess } = useBookAccess();
  const book = `Cambridge ${number}`;
  const test = selection.book === book ? selection.test : 'T1';

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
      {/* Stays fixed under the site header while the word list scrolls. */}
      <div className="sticky z-30 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between md:rounded-3xl md:p-5" style={{ top: 'calc(var(--header-height, 64px) + 8px)' }}>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(`/books/${module}`)} aria-label="Back to book list" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200">
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
          <h2 className="whitespace-nowrap text-lg font-black text-slate-800 md:text-xl">{book}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden text-xs font-bold text-slate-400 md:inline">Choose a test:</span>
          <div className="grid w-full grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 md:inline-flex md:w-auto">
            {TESTS.map(item => (
              <TestButton
                key={item}
                test={item}
                selected={item === test}
                unlocked={hasFullAccess}
                isFreeTest={!hasFullAccess && item === 'T1'}
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
              <p className="text-sm font-bold text-slate-700">{book} ({test}): no words found</p>
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
