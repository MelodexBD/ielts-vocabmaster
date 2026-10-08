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
import { useNotifications } from '../lib/notifications';

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


// Mobile-only menu (☰) for logged-in visitors, as a slide-in drawer: the profile and account
// actions on top, then the four modules (the current page's module is shown as active).
function ModuleMenu() {
  const { profile, isAdmin } = useAuth();
  const { openPricing } = useUI();
  const navigate = useNavigate();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const books = useMatch('/books/:module/*');
  const practice = useMatch('/practice/:module');
  const activeModule = books?.params.module || practice?.params.module;

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-label="Open menu and profile" aria-haspopup="dialog" aria-expanded={open} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-forest-500 hover:text-forest-700">
        <i className="fa-solid fa-bars text-base" aria-hidden="true"></i>
      </button>
      <Drawer open={open} onClose={close} title={<AccountBadge isAdmin={isAdmin} />} labelledBy="moduleDrawerTitle">
        {/* Photo on top so the name and the full email get the whole width; long emails wrap instead of being cut. */}
        <div className="mb-2 flex flex-col items-center rounded-2xl bg-forest-50/70 px-3 py-4 text-center">
          <Avatar profile={profile} className="h-14 w-14 shrink-0 text-base ring-2 ring-forest-500/20" />
          <p className="mt-2 w-full break-words text-sm font-black text-slate-900">{profile?.name}</p>
          <p className="mt-0.5 w-full break-all text-xs font-semibold text-slate-600">{profile?.email}</p>
        </div>
        <div className="space-y-1">
          {isAdmin && (
            <Link to="/admin" onClick={close} className="flex w-full items-center gap-3 rounded-xl bg-forest-50/70 px-3 py-3 text-sm font-bold text-forest-700 hover:bg-forest-100">
              <i className="fa-solid fa-screwdriver-wrench w-5 text-center text-forest-600"></i><span>Admin panel</span>
            </Link>
          )}
          <VerifyAdminButton onDone={close} className="flex w-full items-center gap-3 rounded-xl bg-amber-50 px-3 py-3 text-left text-sm font-bold text-amber-700 hover:bg-amber-100" />
          {!isAdmin && (
            <button type="button" onClick={() => { close(); openPricing(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-amber-600 hover:bg-amber-50">
              <i className="fa-solid fa-crown w-5 text-center"></i><span>Upgrade to Premium</span>
            </button>
          )}
        </div>

        <p className="mb-2 mt-4 border-t border-slate-100 px-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Modules</p>
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

        <div className="mt-3 border-t border-slate-100 pt-2">
          <button type="button" onClick={() => { close(); logout(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50">
            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i><span>Log out</span>
          </button>
        </div>
      </Drawer>
    </div>
  );
}

// Desktop bell next to the profile; phones have it in the bottom navigation.
function NotificationBell() {
  const { unreadCount } = useNotifications();
  return (
    <Link to="/notifications" aria-label={unreadCount ? `Notifications, ${unreadCount} new` : 'Notifications'} className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-forest-500 hover:text-forest-700 md:flex">
      <i className="fa-solid fa-bell text-base"></i>
      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black leading-none text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
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
        {status !== 'loading' && <NotificationBell />}
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
