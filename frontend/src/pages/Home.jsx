import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { MODULE_META, MODULE_NAMES } from '../lib/data';
import { moduleProgress, overallProgress } from '../lib/progress';
import Slider from '../components/Slider';
import ProgressRing from '../components/ProgressRing';

const OVERALL_CIRCUMFERENCE = 2 * Math.PI * 40;

function ModuleCards() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, completedTests } = useAuth();
  const { moduleSections } = useSiteData();
  const showProgress = isLoggedIn && !isAdmin;

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 md:text-sm">Main modules</h3>
        <span className="hidden text-xs font-semibold text-slate-400 md:inline">Click a module to choose a book</span>
      </div>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
        {MODULE_NAMES.map(name => {
          // The admin can replace the card subtitle with the section summary from "Home Section Upload".
          const summary = moduleSections[name]?.summary;
          const subtitle = typeof summary === 'string' && summary.trim() ? summary : MODULE_META[name].cardSubtitle;
          return (
            <button key={name} type="button" onClick={() => navigate(`/books/${name}`)} className="group relative flex h-36 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all hover:border-forest-500 hover:shadow-xl active:scale-95 md:h-48 md:rounded-3xl md:p-6">
              {showProgress && <ProgressRing percentage={moduleProgress(completedTests, name)} label={`${name} progress`} />}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-xl text-forest-600 shadow-sm transition-all group-hover:bg-forest-600 group-hover:text-white md:h-14 md:w-14 md:rounded-2xl md:text-2xl">
                <i className={`fa-solid ${MODULE_META[name].icon}`}></i>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-800 md:text-lg">{name}</h4>
                <p className="line-clamp-2 text-xs font-medium text-slate-400 md:text-sm">{subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LearningDashboard() {
  const { isLoggedIn, isAdmin, completedTests } = useAuth();
  const { bookRange } = useSiteData();
  const overall = overallProgress(completedTests);
  const totalTests = (bookRange.end - bookRange.start + 1) * 4;
  const freeTests = bookRange.start <= 10 && bookRange.end >= 10 ? 1 : 0;

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
          <h3 className="text-base font-black text-slate-800 md:text-lg">Cambridge test preparation progress</h3>
          <p className="text-xs font-medium text-slate-400">Progress is calculated from the Cambridge 10 tests completed in each module.</p>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 border-t border-slate-100 pt-4 md:w-auto md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <p className="text-xs font-bold text-slate-400">Free words</p>
          <p className="text-base font-black text-forest-700">50+</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <p className="text-xs font-bold text-slate-400">{isAdmin ? 'Admin access' : 'Locked tests'}</p>
          <p className={`text-base font-black ${isAdmin ? 'text-emerald-600' : 'text-amber-600'}`}>{isAdmin ? 'All unlocked' : `${totalTests - freeTests} tests`}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <p className="text-xs font-bold text-slate-400">Target</p>
          <p className="text-base font-black text-emerald-600">8.0</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex w-full flex-col space-y-6 p-4 md:p-0">
      <Slider />
      <ModuleCards />
      <LearningDashboard />
    </div>
  );
}
