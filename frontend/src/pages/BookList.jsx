import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { MODULE_NAMES } from '../lib/data';
import useBookAccess from '../lib/useBookAccess';

function BookBadge({ number }) {
  const { isAdmin, isPremium } = useAuth();
  // Admin sees no badge; premium members see UNLOCKED; everyone else sees FREE / PRO.
  if (isAdmin) return null;
  if (isPremium) return <span className="absolute right-2.5 top-2.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">UNLOCKED</span>;
  if (number === 10) return <span className="absolute right-2.5 top-2.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">FREE</span>;
  return <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-500"><i className="fa-solid fa-crown text-[9px]"></i>PRO</span>;
}

export default function BookList() {
  const { module } = useParams();
  const navigate = useNavigate();
  const { bookRange } = useSiteData();
  const { canOpenBook, showLockedPrompt } = useBookAccess();

  if (!MODULE_NAMES.includes(module)) return <Navigate to="/" replace />;

  const books = [];
  for (let number = bookRange.start; number <= bookRange.end; number++) books.push(number);

  const openBook = number => {
    if (!canOpenBook(number)) {
      showLockedPrompt();
      return;
    }
    navigate(`/books/${module}/${number}`);
  };

  return (
    <div className="flex w-full flex-col space-y-5 p-4 md:p-0">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/')} aria-label="Back to home" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200">
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 md:text-xl">{module} Module</h2>
            <p className="text-xs font-medium text-slate-400">Books {bookRange.start} to {bookRange.end}</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate('/')} className="hidden text-xs font-bold text-forest-600 hover:underline md:inline-block">← Back to dashboard</button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Choose a book</p>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {books.map(number => (
            <button key={number} type="button" onClick={() => openBook(number)} className="group relative flex h-28 flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-sm transition-all hover:border-forest-500 hover:bg-forest-50/60 hover:shadow-lg active:scale-95 md:h-36 md:rounded-3xl">
              <BookBadge number={number} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-forest-600 md:text-xs">Book</span>
              <span className="mt-1 text-2xl font-black text-slate-800 group-hover:text-forest-600 md:text-3xl">{number}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
