import { forwardRef, useCallback, useRef, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { useUI } from '../context/UIContext';
import { MODULE_META, MODULE_NAMES } from '../lib/data';
import useLogout from '../lib/useLogout';
import useClickOutside from '../lib/useClickOutside';
import Avatar from './Avatar';
import Drawer from './Drawer';
import { useAuthLink } from '../lib/authRedirect';
import AccountBadge from './AccountBadge';

function MembershipBadge() {
  const { isAdmin, isPremium, needsAdminVerification } = useAuth();
  const [text, color] = isAdmin
    ? ['Admin', 'text-forest-600']
    : needsAdminVerification
      ? ['Admin · email not verified', 'text-rose-600']
      : isPremium ? ['Premium Member', 'text-emerald-600'] : ['Free Tier Member', 'text-amber-600'];
  return <p className={`text-[11px] font-bold ${color}`}>{text}</p>;
}

// Shown to the admin account while its email is not verified yet: sends the verification link again.
export function VerifyAdminButton({ onDone, className }) {
  const { needsAdminVerification, sendAdminVerification } = useAuth();
  if (!needsAdminVerification) return null;
  return (
    <button type="button" onClick={() => { onDone?.(); sendAdminVerification(); }} className={className}>
      <i className="fa-solid fa-envelope-circle-check text-sm text-amber-600"></i>
      <span>Verify email to open Admin panel</span>
    </button>
  );
}

function ProfileMenu() {
  const { profile, isAdmin } = useAuth();
  const { openPricing } = useUI();
  const navigate = useNavigate();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  return (
    <div ref={ref} className="relative hidden items-center gap-2 md:flex">
      <button type="button" onClick={() => setOpen(value => !value)} className="flex items-center gap-3 rounded-2xl p-1 transition-colors hover:bg-slate-50 focus:outline-none">
        <div className="relative">
          <Avatar profile={profile} className="h-10 w-10 text-sm shadow-md ring-2 ring-forest-500/20" />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
        </div>
        <div className="hidden text-left sm:block">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-extrabold leading-tight text-slate-900">{profile?.name}</h2>
            <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
          </div>
          <MembershipBadge />
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100vh-5rem)] w-64 space-y-1 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl">
          <div className="border-b border-slate-100 px-3 py-2">
            <AccountBadge isAdmin={isAdmin} />
            <p className="mt-1.5 break-all text-sm font-black text-slate-800">{profile?.email}</p>
          </div>
          {isAdmin && (
            <Link to="/admin" className="flex w-full items-center gap-3 rounded-xl bg-forest-50/70 px-3 py-2 text-left text-xs font-bold text-forest-700 transition-all hover:bg-forest-100">
              <i className="fa-solid fa-screwdriver-wrench text-sm text-forest-600"></i>
              <span>Admin panel (control)</span>
            </Link>
          )}
          <VerifyAdminButton onDone={close} className="flex w-full items-center gap-3 rounded-xl bg-amber-50 px-3 py-2 text-left text-xs font-bold text-amber-700 transition-all hover:bg-amber-100" />
          {/* The admin already has full access, so the upgrade option is hidden. */}
          {!isAdmin && (
            <button type="button" onClick={() => { close(); openPricing(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-amber-600 transition-all hover:bg-amber-50">
              <i className="fa-solid fa-crown text-sm"></i>
              <span>Upgrade to Premium</span>
            </button>
          )}
          <button type="button" onClick={() => { close(); navigate('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 transition-all hover:bg-forest-50 hover:text-forest-700">
            <i className="fa-solid fa-gauge-high text-sm text-forest-600"></i>
            <span>Dashboard view</span>
          </button>
          <div className="border-t border-slate-100 pt-1">
            <button type="button" onClick={() => { close(); logout(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 transition-all hover:bg-rose-50">
              <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile-only menu (☰) with the four modules, shown to logged-in visitors as a slide-in drawer.
function ModuleMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  // The module of the current page (practice or its books) is shown as active, like the desktop sidebar.
  const books = useMatch('/books/:module/*');
  const practice = useMatch('/practice/:module');
  const activeModule = books?.params.module || practice?.params.module;

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-label="Open module menu" aria-haspopup="dialog" aria-expanded={open} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-forest-500 hover:text-forest-700">
        <i className="fa-solid fa-bars text-base" aria-hidden="true"></i>
      </button>
      <Drawer open={open} onClose={close} title="Navigation menu" labelledBy="moduleDrawerTitle">
        {MODULE_NAMES.map(name => {
          const active = name === activeModule;
          return (
            <button key={name} type="button" aria-current={active ? 'page' : undefined} onClick={() => { close(); navigate(`/practice/${name}`); }} className={`mb-1 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold transition-colors ${active ? 'border-forest-200 bg-forest-50 text-forest-700' : 'border-transparent text-slate-700 hover:bg-forest-50 hover:text-forest-700'}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-forest-600 text-white shadow-sm' : 'bg-forest-50 text-forest-600'}`}><i className={`fa-solid ${MODULE_META[name].icon} text-base`}></i></span>
              <span>{MODULE_META[name].navLabel}</span>
              {active && <i className="fa-solid fa-circle ml-auto text-[7px] text-forest-600" aria-hidden="true"></i>}
            </button>
          );
        })}
      </Drawer>
    </div>
  );
}

const Header = forwardRef(function Header(_, ref) {
  const { status } = useAuth();
  const { bookRange } = useSiteData();
  const authLink = useAuthLink();

  return (
    <header ref={ref} className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 shadow-sm md:px-8">
      <Link to="/" className="flex items-center gap-2.5">
        <div>
          <span className="text-base font-black leading-tight tracking-tight text-slate-900 md:text-lg">IELTS <span className="text-forest-600">VocabMaster</span></span>
          <span className="ml-1 hidden rounded-md bg-forest-100 px-2 py-0.5 text-[10px] font-bold text-forest-700 sm:inline-block">Book {bookRange.start}-{bookRange.end}</span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        {/* Nothing is shown until Firebase knows the login state, so neither side ever flashes. */}
        {status === 'guest' && (
          <div className="flex items-center gap-2">
            <Link to={authLink('login')} className="whitespace-nowrap rounded-lg bg-forest-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-700">Log in</Link>
            <Link to={authLink('signup')} className="whitespace-nowrap rounded-lg bg-forest-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-700">Sign up</Link>
          </div>
        )}
        {status === 'user' && (
          <>
            <ProfileMenu />
            <ModuleMenu />
          </>
        )}
      </div>
    </header>
  );
});

export default Header;
