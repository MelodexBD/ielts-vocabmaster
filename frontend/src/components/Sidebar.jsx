import { NavLink, useMatch } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MODULE_META, MODULE_NAMES } from '../lib/data';
import { overallProgress } from '../lib/progress';

function NavItem({ to, icon, label, active }) {
  return (
    <NavLink
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all ${active ? 'border border-forest-100 bg-forest-50 text-forest-700' : 'text-slate-600 hover:bg-forest-50/60 hover:text-forest-700'}`}
    >
      <i className={`fa-solid ${icon} text-base ${active ? 'text-forest-600' : 'text-slate-400'}`}></i>
      <span>{label}</span>
    </NavLink>
  );
}

// Desktop navigation on the left; the active item follows the current page's module.
export default function Sidebar() {
  const { isLoggedIn, isAdmin, completedTests } = useAuth();
  const home = useMatch('/');
  const plan = useMatch('/plan');
  const books = useMatch('/books/:module/*');
  const practice = useMatch('/practice/:module');
  const activeModule = books?.params.module || practice?.params.module;

  return (
    <aside className="sticky top-24 hidden h-fit w-64 shrink-0 flex-col space-y-2 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:flex">
      <span className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation menu</span>
      <NavItem to="/" icon="fa-house" label="Home" active={!!home} />
      <NavItem to="/plan" icon="fa-calendar-check" label="Daily study plan" active={!!plan} />
      {MODULE_NAMES.map(name => (
        <NavItem key={name} to={`/practice/${name}`} icon={MODULE_META[name].icon} label={MODULE_META[name].navLabel} active={activeModule === name} />
      ))}

      {!isAdmin && (
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-forest-100 bg-forest-50/80 p-4">
            {isLoggedIn && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-600 text-xs font-bold text-white">
                {overallProgress(completedTests)}%
              </div>
            )}
            <div>
              <p className="text-xs font-extrabold text-forest-800">Free preparation progress</p>
              <p className="text-[10px] font-semibold text-forest-600">Average progress across four modules</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
