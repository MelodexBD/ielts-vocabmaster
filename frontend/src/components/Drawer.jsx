import { useEffect } from 'react';

// Panel that slides in from the right edge over a dimmed backdrop (used for the mobile menus).
// Closes on the backdrop, the × button or the Escape key; the page behind does not scroll while open.
export default function Drawer({ open, onClose, title, children, labelledBy }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = event => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}></div>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          {typeof title === 'string'
            ? <p id={labelledBy} className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{title}</p>
            : <div id={labelledBy}>{title}</div>}
          <button type="button" onClick={onClose} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{children}</div>
      </aside>
    </div>
  );
}
