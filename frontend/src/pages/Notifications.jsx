import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { markNotificationsSeen, useNotifications } from '../lib/notifications';

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

// Daily notices posted from the admin panel. Opening this page marks them all as seen,
// which removes the red dot; the ones that were new keep a "New" label until the page is left.
export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, lastSeen } = useNotifications();
  const [seenBefore] = useState(lastSeen);

  useEffect(() => {
    markNotificationsSeen(notifications[0]?.createdAt);
  }, [notifications]);

  return (
    <div className="flex w-full flex-col space-y-4 p-4 md:p-0">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
        <button type="button" onClick={() => navigate('/')} aria-label="Back to home" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200">
          <i className="fa-solid fa-chevron-left text-sm"></i>
        </button>
        <div>
          <h2 className="text-base font-extrabold text-slate-800 md:text-xl">Notifications</h2>
          <p className="text-xs font-medium text-slate-400">Important daily updates from IELTS VocabMaster</p>
        </div>
      </div>

      {notifications.length ? (
        <ul className="space-y-3">
          {notifications.map(item => {
            const isNew = (item.createdAt || '') > seenBefore;
            return (
              <li key={item.id} className={`flex gap-3 rounded-2xl border bg-white p-4 shadow-sm md:rounded-3xl md:p-5 ${isNew ? 'border-forest-200' : 'border-slate-200/80'}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isNew ? 'bg-forest-600 text-white' : 'bg-forest-50 text-forest-600'}`}>
                  <i className="fa-solid fa-bell"></i>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="break-words text-sm font-extrabold text-slate-800">{item.title}</h3>
                    {isNew && <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">New</span>}
                  </div>
                  {item.message && <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-600">{item.message}</p>}
                  <p className="mt-2 text-[11px] font-semibold text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:rounded-3xl md:p-12">
          <i className="fa-regular fa-bell text-4xl text-slate-300"></i>
          <p className="text-sm font-bold text-slate-700">No notifications yet</p>
          <p className="text-xs text-slate-400">Important daily updates will appear here.</p>
        </div>
      )}
    </div>
  );
}
