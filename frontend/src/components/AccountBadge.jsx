// Account type pill shown at the top of the profile menus.
// Admin: dark forest gradient with gold shield and text. Student: soft green with a graduation cap.
export default function AccountBadge({ isAdmin }) {
  if (isAdmin) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-forest-900 via-forest-700 to-forest-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-300 shadow-sm shadow-forest-900/30 ring-1 ring-amber-300/40">
        <i className="fa-solid fa-shield-halved text-[10px] text-amber-300"></i>
        Admin account
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-forest-700 ring-1 ring-forest-200">
      <i className="fa-solid fa-graduation-cap text-[10px] text-forest-600"></i>
      Student account
    </span>
  );
}
