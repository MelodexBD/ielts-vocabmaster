import { useMatch, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useNotifications } from '../lib/notifications';

function NavButton({ icon, label, active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`flex w-full flex-col items-center justify-center py-1 transition-all ${active ? 'text-forest-600' : 'text-slate-400 hover:text-slate-600'}`}>
      <span className="relative">
        <i className={`fa-solid ${icon} text-lg`}></i>
        {children}
      </span>
      <span className={`mt-0.5 text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  );
}

// Bottom navigation bar for phones. The profile and account actions live in the ☰ menu.
export default function MobileNav() {
  const { hasFullAccess } = useAuth();
  const { openPricing } = useUI();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const onHome = useMatch('/');
  const onPlan = useMatch('/plan');
  const onDashboard = useMatch('/progress');
  const onNotifications = useMatch('/notifications');

  return (
    <div className="md:hidden">
      <nav className="fixed inset-x-0 bottom-0 z-30 select-none border-t border-slate-200 bg-white px-2 py-1.5 shadow-lg">
        <div className={`mx-auto grid w-full max-w-md items-center justify-items-center ${hasFullAccess ? 'grid-cols-4' : 'grid-cols-5'}`}>
          <NavButton icon="fa-house" label="Home" active={!!onHome} onClick={() => navigate('/')} />
          <NavButton icon="fa-calendar-check" label="Plan" active={!!onPlan} onClick={() => navigate('/plan')} />

          {/* PRO sits in the middle until the account has full access: while premium lasts (and for the
              admin) it is hidden, and it comes back by itself when premium ends. */}
          {!hasFullAccess && (
            <button type="button" onClick={openPricing} className="group flex w-full flex-col items-center justify-center focus:outline-none">
              <div className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-amber-500 to-amber-400 text-xl text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95 group-hover:scale-105">
                <i className="fa-solid fa-crown text-base"></i>
              </div>
              <span className="mt-0.5 text-[10px] font-bold text-amber-600">PRO</span>
            </button>
          )}

          <NavButton icon="fa-chart-line" label="Dashboard" active={!!onDashboard} onClick={() => navigate('/progress')} />

          <NavButton icon="fa-bell" label="Notifications" active={!!onNotifications} onClick={() => navigate('/notifications')}>
            {unreadCount > 0 && (
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-black leading-none text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavButton>
        </div>
      </nav>
    </div>
  );
}
