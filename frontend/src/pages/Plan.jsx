import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { useUI } from '../context/UIContext';
import { MODULE_META, TESTS } from '../lib/data';
import { useAuthLink } from '../lib/authRedirect';
import useBookAccess from '../lib/useBookAccess';

// What to study on each day, in the same order for every test.
const DAILY_TASKS = [
  { module: 'Reading', title: 'Reading vocabulary', detail: 'Learn every word of this test with its meaning, synonyms and antonyms.', minutes: 20, path: number => `/books/Reading/${number}` },
  { module: 'Listening', title: 'Listening practice', detail: 'Listen to the recording and note down the new words you hear.', minutes: 30, path: () => '/practice/Listening' },
  { module: 'Writing', title: 'Writing task', detail: 'Write the task answer, then compare it with the model answer.', minutes: 40, path: () => '/practice/Writing' },
  { module: 'Speaking', title: 'Speaking cue card', detail: 'Speak about the cue card for two minutes and record yourself.', minutes: 15, path: () => '/practice/Speaking' }
];

// One test per day, in order: Book 10 Test 1, Book 10 Test 2, ... up to the last book's Test 4.
function buildDays(bookRange) {
  const days = [];
  for (let number = bookRange.start; number <= bookRange.end; number++) {
    TESTS.forEach(test => days.push({ day: days.length + 1, number, test }));
  }
  return days;
}

const testLabel = test => `Test ${test.slice(1)}`;

function DayDetail({ entry, previous, isToday, done, locked, onOpen, onToggleDone }) {
  const totalMinutes = DAILY_TASKS.reduce((sum, task) => sum + task.minutes, 0) + (previous ? 10 : 0);
  return (
    <section className="space-y-4 rounded-2xl border border-forest-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${isToday ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <i className={`fa-solid ${isToday ? 'fa-sun' : 'fa-calendar-day'} text-[10px]`}></i>{isToday ? `Today · Day ${entry.day}` : `Day ${entry.day}`}
          </span>
          <h3 className="mt-2 text-lg font-black text-slate-900">Book {entry.number} · {testLabel(entry.test)}</h3>
          <p className="text-xs font-medium text-slate-400">About {totalMinutes} minutes · do the steps in this order</p>
        </div>
        {done && <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700"><i className="fa-solid fa-check mr-1"></i>Done</span>}
        {locked && <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-600"><i className="fa-solid fa-crown text-[10px]"></i>PRO</span>}
      </div>

      <ol className="space-y-2">
        {previous && (
          <li>
            <button type="button" onClick={() => onOpen(previous, DAILY_TASKS[0])} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left transition-colors hover:border-forest-300 hover:bg-forest-50/60">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-forest-600 shadow-sm"><i className="fa-solid fa-rotate-left"></i></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-slate-800">Quick revision</span>
                <span className="block text-xs text-slate-500">Revise yesterday's words: Book {previous.number} · {testLabel(previous.test)} (10 min)</span>
              </span>
              <i className="fa-solid fa-chevron-right text-xs text-slate-400"></i>
            </button>
          </li>
        )}
        {DAILY_TASKS.map((task, index) => (
          <li key={task.module}>
            <button type="button" onClick={() => onOpen(entry, task)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-forest-300 hover:bg-forest-50/60">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-600">
                <i className={`fa-solid ${MODULE_META[task.module].icon}`}></i>
                <span className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-forest-600 text-[9px] font-black text-white">{index + 1}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-slate-800">{task.title} <span className="font-semibold text-slate-400">· {task.minutes} min</span></span>
                <span className="block text-xs text-slate-500">{task.detail}</span>
              </span>
              <i className={`fa-solid ${locked ? 'fa-crown text-amber-500' : 'fa-chevron-right text-slate-400'} text-xs`}></i>
            </button>
          </li>
        ))}
      </ol>

      {!locked && (
        <button type="button" onClick={onToggleDone} aria-pressed={done} className={`w-full rounded-xl py-3 text-sm font-extrabold transition-all ${done ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50' : 'bg-forest-600 text-white shadow-sm hover:bg-forest-700'}`}>
          {done ? 'Done ✓ · tap to undo' : `Mark Day ${entry.day} as done`}
        </button>
      )}
    </section>
  );
}

// Daily study plan: one test per day in book order, with what to do first, second and so on.
export default function Plan() {
  const navigate = useNavigate();
  const authLink = useAuthLink();
  const { isLoggedIn, planDone, togglePlanDay } = useAuth();
  const { bookRange } = useSiteData();
  const { setSelection } = useUI();
  const { canOpenBook, showLockedPrompt } = useBookAccess();
  const days = buildDays(bookRange);
  const today = days.find(item => !planDone.includes(item.day)) || days[days.length - 1];
  const [chosenDay, setChosenDay] = useState(null);
  const entry = days.find(item => item.day === chosenDay) || today;
  const doneCount = days.filter(item => planDone.includes(item.day)).length;

  const openTask = (target, task) => {
    if (!canOpenBook(target.number)) {
      showLockedPrompt();
      return;
    }
    setSelection({ book: `Cambridge ${target.number}`, test: target.test });
    navigate(task.path(target.number));
  };

  const toggleDone = () => {
    if (!isLoggedIn) {
      window.notify('Log in or create a free account to save your study plan progress.', 'info');
      navigate(authLink('login'));
      return;
    }
    const finishing = !planDone.includes(entry.day);
    togglePlanDay(entry.day);
    if (finishing) {
      window.notify(`Day ${entry.day} done. Great work!`, 'success');
      setChosenDay(null);
    }
  };

  const books = [];
  for (let number = bookRange.start; number <= bookRange.end; number++) books.push(number);

  return (
    <div className="flex w-full flex-col space-y-4 p-4 md:p-0">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/')} aria-label="Back to home" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200">
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 md:text-xl">Daily study plan</h2>
            <p className="text-xs font-medium text-slate-400">One test a day, in order: Book {bookRange.start} Test 1 to Book {bookRange.end} Test 4</p>
          </div>
        </div>
        {isLoggedIn && (
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>{doneCount} of {days.length} days done</span>
              <span>{Math.round(doneCount / days.length * 100)}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-forest-600 transition-all" style={{ width: `${doneCount / days.length * 100}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <DayDetail
        entry={entry}
        previous={days[entry.day - 2]}
        isToday={entry.day === today.day}
        done={planDone.includes(entry.day)}
        locked={!canOpenBook(entry.number)}
        onOpen={openTask}
        onToggleDone={toggleDone}
      />

      <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">All days</h3>
        {books.map(number => (
          <div key={number}>
            <p className="mb-1.5 flex items-center gap-2 text-xs font-extrabold text-slate-700">
              Book {number}
              {!canOpenBook(number) && <span className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-500"><i className="fa-solid fa-crown text-[9px]"></i>PRO</span>}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {days.filter(item => item.number === number).map(item => {
                const done = planDone.includes(item.day);
                const selected = item.day === entry.day;
                return (
                  <button key={item.day} type="button" onClick={() => setChosenDay(item.day)} aria-pressed={selected} className={`relative rounded-lg border px-1 py-2 text-center transition-all ${selected ? 'border-forest-600 bg-forest-600 text-white' : done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-forest-50'}`}>
                    <span className="block text-[10px] font-bold opacity-80">Day {item.day}</span>
                    <span className="block text-xs font-extrabold">{testLabel(item.test)}</span>
                    {done && !selected && <i className="fa-solid fa-circle-check absolute right-1 top-1 text-[10px] text-emerald-500"></i>}
                    {item.day === today.day && !selected && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-forest-600"></span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
