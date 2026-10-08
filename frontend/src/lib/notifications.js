import { useSyncExternalStore } from 'react';
import { useSiteData } from '../context/SiteDataContext';

// Which notifications this visitor has already seen, kept on this device: the time of the newest
// one they have viewed. Shared by the bell icons and the notifications page.
const SEEN_KEY = 'notifications_seen_at';
const listeners = new Set();

function readSeenAt() {
  try {
    return localStorage.getItem(SEEN_KEY) || '';
  } catch {
    return '';
  }
}

let seenAt = readSeenAt();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function markNotificationsSeen(latest) {
  if (!latest || latest <= seenAt) return;
  seenAt = latest;
  try {
    localStorage.setItem(SEEN_KEY, latest);
  } catch {
    // Without storage the red dot simply comes back on the next visit.
  }
  listeners.forEach(listener => listener());
}

export function useNotifications() {
  const { notifications } = useSiteData();
  const lastSeen = useSyncExternalStore(subscribe, () => seenAt);
  const unreadCount = notifications.filter(item => (item.createdAt || '') > lastSeen).length;
  return { notifications, lastSeen, unreadCount };
}
