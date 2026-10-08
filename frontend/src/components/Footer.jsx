import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const WHATSAPP_URL = 'https://wa.me/8801577773239?text=Hello%20IELTS%20VocabMaster%21';

function IconBox({ icon, className = 'bg-forest-50 text-forest-600' }) {
  return <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${className}`}><i className={icon}></i></span>;
}

export default function Footer() {
  const { openPricing } = useUI();
  const { isAdmin } = useAuth();
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white px-5 pb-24 pt-12 text-slate-600 md:px-12 md:pb-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <div className="space-y-4 md:col-span-5">
          <span className="text-lg font-black text-slate-900">IELTS <span className="text-forest-600">VocabMaster</span></span>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">
            Your complete partner for Cambridge IELTS 10–19 preparation: a smart vocabulary vault, clear answer explanations and timed practice for Reading, Listening, Writing and Speaking.
          </p>
        </div>

        <div className="space-y-4 md:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Quick links</h4>
          <ul className="space-y-3 text-sm font-medium">
            <li>
              <Link to="/" className="flex items-center gap-3 hover:text-forest-600"><IconBox icon="fa-solid fa-house" /><span>Home</span></Link>
            </li>
            {/* The admin already has full access, so premium plans are only offered to everyone else. */}
            {!isAdmin && (
              <li>
                <button type="button" onClick={openPricing} className="flex items-center gap-3 hover:text-forest-600">
                  <IconBox icon="fa-solid fa-crown text-xs" className="bg-gradient-to-tr from-amber-500 to-amber-400 text-white" />
                  <span>Premium plans</span>
                </button>
              </li>
            )}
            <li>
              <Link to="/signup" className="flex items-center gap-3 hover:text-forest-600"><IconBox icon="fa-solid fa-user-plus" /><span>Create a free account</span></Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4 md:col-span-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Help & support</h4>
          <p className="text-sm text-slate-500">Questions about your account, a test or a payment? We're here to help.</p>
          <ul className="space-y-3 text-sm font-medium">
            <li>
              <a href="mailto:ieltsvocabmaster@gmail.com" className="flex items-center gap-3 hover:text-forest-600"><IconBox icon="fa-regular fa-envelope" /><span>ieltsvocabmaster@gmail.com</span></a>
            </li>
            <li>
              <a href="tel:+8801577773239" className="flex items-center gap-3 hover:text-forest-600"><IconBox icon="fa-solid fa-phone" /><span>+880 1577-773239</span></a>
            </li>
            <li>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-forest-600">
                <IconBox icon="fa-brands fa-whatsapp text-base" className="bg-[#25D366]/10 text-[#1ebe5b]" />
                <span>WhatsApp Business</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400 sm:flex-row">
        <p>© 2026 IELTS VocabMaster. All rights reserved.</p>
        <p>Made for IELTS candidates in Bangladesh</p>
      </div>
    </footer>
  );
}
