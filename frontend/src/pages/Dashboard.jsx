import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { useUI } from '../context/UIContext';
import { MODULE_META, MODULE_NAMES, TESTS } from '../lib/data';
import { moduleProgress } from '../lib/progress';
import LearningDashboard from '../components/LearningDashboard';

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Membership status: premium members see until when their PRO access lasts.
function AccessCard() {
  const { isLoggedIn, isAdmin, isPremium, premiumUntil } = useAuth();
  const { openPricing } = useUI();
  if (isAdmin) return null;
  if (isPremium) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm md:rounded-3xl md:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-sm"><i className="fa-solid fa-crown"></i></span>
        <div>
          <p className="text-sm font-extrabold text-slate-800">PRO access active</p>
          <p className="text-xs font-medium text-slate-500">{premiumUntil ? `All books are unlocked until ${formatDate(premiumUntil)}.` : 'All books are unlocked.'}</p>
        </div>
      </section>
    );
  }
  return (
    <section className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><i className="fa-solid fa-crown"></i></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-slate-800">{isLoggedIn ? 'Free account' : 'Not logged in'}</p>
        <p className="text-xs font-medium text-slate-500">Book 10 is free. Get PRO to unlock every book.</p>
      </div>
      <button type="button" onClick={openPricing} className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-amber-600">Get PRO</button>
    </section>
  );
}

// Learning dashboard: overall progress, progress per module and the study plan.
export default function Dashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, completedTests, planDone } = useAuth();
  const { bookRange } = useSiteData();
  const planDays = (bookRange.end - bookRange.start + 1) * TESTS.length;
  const showProgress = isLoggedIn && !isAdmin;

  return (
    <div className="flex w-full flex-col space-y-4 p-4 md:p-0">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
        <button type="button" onClick={() => navigate('/')} aria-label="Back to home" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200">
          <i className="fa-solid fa-chevron-left text-sm"></i>
        </button>
        <div>
          <h2 className="text-base font-extrabold text-slate-800 md:text-xl">Learning dashboard</h2>
          <p className="text-xs font-medium text-slate-400">Your progress and access in one place</p>
        </div>
      </div>

      <AccessCard />
      <LearningDashboard />

      {showProgress && (
        <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Module progress</h3>
          {MODULE_NAMES.map(name => {
            const percentage = moduleProgress(completedTests, name);
            return (
              <button key={name} type="button" onClick={() => navigate(`/books/${name}`)} className="flex w-full items-center gap-3 rounded-xl p-1 text-left hover:bg-forest-50/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-600"><i className={`fa-solid ${MODULE_META[name].icon}`}></i></span>
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between text-xs font-bold text-slate-700"><span>{name}</span><span>{percentage}%</span></span>
                  <span className="mt-1 block h-2 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-forest-600" style={{ width: `${percentage}%` }}></span>
                  </span>
                </span>
              </button>
            );
          })}
        </section>
      )}

      <button type="button" onClick={() => navigate('/plan')} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-colors hover:border-forest-300 md:rounded-3xl md:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-600 text-white"><i className="fa-solid fa-calendar-check"></i></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-slate-800">Daily study plan</span>
          <span className="block text-xs font-medium text-slate-500">{isLoggedIn ? `${planDone.length} of ${planDays} days done` : `${planDays} days, one test a day`}</span>
        </span>
        <i className="fa-solid fa-chevron-right text-xs text-slate-400"></i>
      </button>
    </div>
  );
}
