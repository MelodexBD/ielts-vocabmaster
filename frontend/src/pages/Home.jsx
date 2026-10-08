import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { MODULE_META, MODULE_NAMES } from '../lib/data';
import { moduleProgress } from '../lib/progress';
import Slider from '../components/Slider';
import ProgressRing from '../components/ProgressRing';
import LearningDashboard from '../components/LearningDashboard';

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

export default function Home() {
  return (
    <div className="flex w-full flex-col space-y-6 p-4 md:p-0">
      <Slider />
      <ModuleCards />
      <LearningDashboard />
    </div>
  );
}
