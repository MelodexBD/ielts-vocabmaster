import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { rememberPricingIntent, useAuthLink } from '../lib/authRedirect';

const PLANS = [
  { name: '1 Month Plan', label: '1 Month', price: '৳290', note: 'Short-term quick revision', button: 'Select', style: 'standard' },
  { name: '3 Month Plan', label: '3 Months', price: '৳690', note: 'Perfect IELTS preparation', button: 'Unlock', style: 'popular', badge: 'Most popular' },
  { name: '6 Month Plan', label: '6 Months', price: '৳1150', note: 'Continuous practice & band boosting', button: 'Select', style: 'standard' },
  { name: '1 Year (Lifetime)', label: '1 Year', price: '৳1950', note: 'Full access including all new books', button: 'Unlock', style: 'best', badge: 'Best value' }
];

const PLAN_STYLES = {
  standard: {
    card: 'border-slate-200 bg-slate-50/50 hover:border-forest-600 hover:bg-forest-50/30',
    price: 'text-forest-700',
    note: 'text-slate-400',
    button: 'bg-slate-200 text-slate-700 group-hover:bg-forest-600 group-hover:text-white'
  },
  popular: {
    card: 'relative border-forest-600 bg-forest-50/40 shadow-sm',
    price: 'text-forest-700',
    note: 'text-slate-500',
    button: 'bg-forest-600 text-white shadow-md',
    badge: 'bg-forest-600'
  },
  best: {
    card: 'relative border-amber-400 bg-amber-50/40 shadow-sm',
    price: 'text-amber-700',
    note: 'text-slate-500',
    button: 'bg-amber-600 text-white shadow-md',
    badge: 'bg-amber-600'
  }
};

function PricingModal({ onClose }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const authLink = useAuthLink();

  const subscribe = plan => {
    // A plan belongs to an account: guests sign up first, then come back here with the plans open again.
    if (!isLoggedIn) {
      rememberPricingIntent();
      onClose();
      window.notify(`Create a free account or log in to get the ${plan.label} plan. You will come right back here.`, 'info');
      navigate(authLink('signup'));
      return;
    }
    // When the bKash/Nagad gateway is added, its success/cancel return URL should be the current page
    // (window.location.href), so the student lands back where they started.
    window.alert(`You selected ${plan.label} (${plan.price}). It will be activated automatically once the bKash/Nagad payment gateway is connected!`);
    onClose();
  };
  return (
    <div className="no-scrollbar fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="my-auto w-full max-w-xl space-y-6 rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-black text-amber-800">
              <i className="fa-solid fa-crown text-[10px]"></i> PRO ACCESS
            </div>
            <h3 className="mt-1 text-xl font-black text-slate-900">Unlock the full book vault</h3>
            <p className="text-xs font-medium text-slate-400">Full explanations and unlimited access to all 40 tests from Book 10 to 19</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {PLANS.map(plan => {
            const style = PLAN_STYLES[plan.style];
            return (
              <div key={plan.name} className={`group cursor-pointer rounded-2xl border-2 p-4 transition-all ${style.card}`}>
                {plan.badge && <span className={`absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white ${style.badge}`}>{plan.badge}</span>}
                <div className="flex items-start justify-between">
                  <span className="text-sm font-extrabold text-slate-800">{plan.name}</span>
                  <span className={`text-xs font-black ${style.price}`}>{plan.price}</span>
                </div>
                <p className={`mt-1 text-[11px] ${style.note}`}>{plan.note}</p>
                <button type="button" onClick={() => subscribe(plan)} className={`mt-3 w-full rounded-xl py-2 text-xs font-bold transition-all ${style.button}`}>{plan.button}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AuthPromptModal({ onClose }) {
  const authLink = useAuthLink();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-md space-y-5 rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-forest-100 bg-forest-50 text-2xl text-forest-600 shadow-inner">
          <i className="fa-solid fa-crown text-amber-500"></i>
        </div>
        <div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">This content is locked</span>
          <h3 className="mt-2 text-xl font-black text-slate-900">Create a free account to unlock</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Create a completely free account now to access all book test solutions and vocabulary. No credit card required!
          </p>
        </div>
        <div className="space-y-2 pt-2">
          <Link to={authLink('signup')} onClick={onClose} className="block w-full rounded-xl bg-forest-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-forest-900/20 transition-all hover:bg-forest-700 active:scale-95">
            Create free account / Log in
          </Link>
          <button type="button" onClick={onClose} className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Modals() {
  const { modal, closeModal } = useUI();
  if (modal === 'pricing') return <PricingModal onClose={closeModal} />;
  if (modal === 'authPrompt') return <AuthPromptModal onClose={closeModal} />;
  return null;
}
