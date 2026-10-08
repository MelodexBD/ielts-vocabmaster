import { useLocation } from 'react-router-dom';

const REOPEN_PRICING_KEY = 'reopen_pricing_after_login';

// Login and sign-up links carry the current page as ?next=..., so after logging in the visitor
// returns to the page they came from instead of the home page.
export function useAuthLink() {
  const location = useLocation();
  return (page = 'login') => {
    const here = location.pathname + location.search;
    const onAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    return onAuthPage || here === '/' ? `/${page}` : `/${page}?next=${encodeURIComponent(here)}`;
  };
}

// Only same-site paths are accepted, so a crafted ?next= link cannot send users to another website.
export function safeNextPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.startsWith('/login') || value.startsWith('/signup')) return '/';
  return value;
}

// A guest who picks a premium plan logs in first; the plans open again on the page they return to.
export function rememberPricingIntent() {
  try {
    sessionStorage.setItem(REOPEN_PRICING_KEY, '1');
  } catch {
    // Without sessionStorage the visitor just opens the plans again themselves.
  }
}

export function takePricingIntent() {
  try {
    const wanted = sessionStorage.getItem(REOPEN_PRICING_KEY) === '1';
    sessionStorage.removeItem(REOPEN_PRICING_KEY);
    return wanted;
  } catch {
    return false;
  }
}
