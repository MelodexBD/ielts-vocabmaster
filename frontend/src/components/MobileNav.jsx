import { useCallback, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import useLogout from '../lib/useLogout';
import Avatar from './Avatar';
import { VerifyAdminButton } from './Header';
import Drawer from './Drawer';
import AccountBadge from './AccountBadge';

// Bottom navigation bar and account menu for phones.
export default function MobileNav() {
  const { isLoggedIn, isAdmin, profile } = useAuth();
  const { openPricing } = useUI();
  const navigate = useNavigate();
  const logout = useLogout();
  const onHome = useMatch('/');
  const [menuOpen, setMenuOpen] = useState(false);
  const close = useCallback(() => setMenuOpen(false), []);

  const onProfileClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setMenuOpen(true);
  };

  return (
    <div className="md:hidden">
      <nav className="fixed inset-x-0 bottom-0 z-30 select-none border-t border-slate-200 bg-white px-2 py-1.5 shadow-lg">
        <div className={`mx-auto grid w-full max-w-md items-center justify-items-center ${isAdmin ? 'grid-cols-4' : 'grid-cols-5'}`}>
          <button type="button" onClick={() => navigate('/')} className={`flex w-full flex-col items-center justify-center py-1 transition-all ${onHome ? 'text-forest-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <i className="fa-solid fa-house text-lg"></i>
            <span className="mt-0.5 text-[10px] font-bold">Home</span>
          </button>

          <button type="button" onClick={() => window.notify('Type a word or test name to search', 'info')} className="flex w-full flex-col items-center justify-center py-1 text-slate-400 transition-all hover:text-slate-600">
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
            <span className="mt-0.5 text-[10px] font-medium">Search</span>
          </button>

          {/* The admin already has full access, so the PRO button is for everyone else. */}
          {!isAdmin && (
            <button type="button" onClick={openPricing} className="group flex w-full flex-col items-center justify-center focus:outline-none">
              <div className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-amber-500 to-amber-400 text-xl text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95 group-hover:scale-105">
                <i className="fa-solid fa-crown text-base"></i>
              </div>
              <span className="mt-0.5 text-[10px] font-bold text-amber-600">PRO</span>
            </button>
          )}

          <button type="button" onClick={() => window.notify('Loading progress tracker...', 'info')} className="flex w-full flex-col items-center justify-center py-1 text-slate-400 transition-all hover:text-slate-600">
            <i className="fa-solid fa-chart-column text-lg"></i>
            <span className="mt-0.5 text-[10px] font-medium">Progress</span>
          </button>

          <button type="button" onClick={onProfileClick} aria-label="Open profile and menu" aria-haspopup="dialog" aria-expanded={menuOpen} className={`flex w-full flex-col items-center justify-center py-1 transition-all ${isLoggedIn ? 'text-forest-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {isLoggedIn
              ? <Avatar profile={profile} className="h-7 w-7 text-[10px] ring-2 ring-forest-500/30" />
              : <i className="fa-solid fa-user text-lg"></i>}
            <span className="mt-0.5 text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      <Drawer open={menuOpen} onClose={close} title={<AccountBadge isAdmin={isAdmin} />} labelledBy="profileDrawerTitle">
        {/* Photo on top so the name and the full email get the whole width; long emails wrap instead of being cut. */}
        <div className="mb-3 flex flex-col items-center rounded-2xl bg-forest-50/70 px-3 py-4 text-center">
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
          <button type="button" onClick={() => { close(); navigate('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-forest-50 hover:text-forest-700">
            <i className="fa-solid fa-gauge-high w-5 text-center text-forest-600"></i><span>Dashboard view</span>
          </button>
          <div className="border-t border-slate-100 pt-1">
            <button type="button" onClick={() => { close(); logout(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50">
              <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i><span>Log out</span>
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
