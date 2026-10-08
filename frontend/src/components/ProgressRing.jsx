// Small circular progress indicator used on the module cards.
const CIRCUMFERENCE = 2 * Math.PI * 16;

export default function ProgressRing({ percentage, label }) {
  return (
    <div className="absolute right-3 top-3 h-11 w-11" role="img" aria-label={label}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle cx="18" cy="18" r="16" fill="none" stroke="#2d5a43" strokeWidth="3" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - percentage / 100)} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-slate-700">{percentage}%</span>
    </div>
  );
}
