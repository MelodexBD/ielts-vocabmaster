import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { overallProgress } from '../lib/progress';

const OVERALL_CIRCUMFERENCE = 2 * Math.PI * 40;

// Overall progress and access summary, shown on the home page and the Dashboard page.
export default function LearningDashboard() {
  const { isLoggedIn, isAdmin, isPremium, completedTests } = useAuth();
  const { bookRange } = useSiteData();
  const overall = overallProgress(completedTests);
  const totalTests = (bookRange.end - bookRange.start + 1) * 4;
  // Book 10 is free for everyone: all four of its tests.
  const freeTests = bookRange.start <= 10 && bookRange.end >= 10 ? 4 : 0;

  return (
    <section className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:flex-row md:p-6">
      <div className="flex w-full items-center gap-5 md:w-auto">
        {isLoggedIn && !isAdmin && (
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center md:h-28 md:w-28">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle className="text-slate-100" strokeWidth="9" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              <circle className="progress-ring-circle text-forest-600" strokeWidth="9" strokeDasharray={OVERALL_CIRCUMFERENCE} strokeDashoffset={OVERALL_CIRCUMFERENCE * (1 - overall / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-800 md:text-2xl">{overall}%</span>
              <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">Completed</span>
            </div>
          </div>
        )}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-forest-100 px-2.5 py-0.5 text-[11px] font-bold text-forest-700">
            <i className="fa-solid fa-chart-line"></i> Learning dashboard
          </div>
          <h3 className="text-base font-black text-slate-800 md:text-lg">Test preparation progress</h3>
          <p className="text-xs font-medium text-slate-400">Progress is calculated from the Book 10 tests completed in each module.</p>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 border-t border-slate-100 pt-4 md:w-auto md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <p className="text-xs font-bold text-slate-400">Free words</p>
          <p className="text-base font-black text-forest-700">50+</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <p className="text-xs font-bold text-slate-400">{isAdmin ? 'Admin access' : isPremium ? 'Premium access' : 'Locked tests'}</p>
          <p className={`text-base font-black ${isAdmin || isPremium ? 'text-emerald-600' : 'text-amber-600'}`}>{isAdmin || isPremium ? 'All unlocked' : `${totalTests - freeTests} tests`}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <p className="text-xs font-bold text-slate-400">Target</p>
          <p className="text-base font-black text-emerald-600">8.0</p>
        </div>
      </div>
    </section>
  );
}
