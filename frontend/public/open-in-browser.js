// Facebook / Messenger open links in their own in-app browser, where Google sign-in is blocked.
// Android: hand the page to Chrome right away. iPhone (or if Chrome did not open): show a short
// banner explaining how to open the page in the browser. The apps' own prompts cannot be removed.
(function () {
  const ua = navigator.userAgent || '';
  const inFacebookApp = /FBAN|FBAV|FB_IAB|FB4A|FBIOS|Messenger|Orca-Android/i.test(ua);
  if (!inFacebookApp) return;

  const ATTEMPT_KEY = 'open_in_chrome_attempted';
  let attempted = false;
  try {
    attempted = sessionStorage.getItem(ATTEMPT_KEY) === '1';
  } catch {
    // Without sessionStorage we simply try once per page load.
  }

  if (/Android/i.test(ua) && !attempted) {
    try {
      sessionStorage.setItem(ATTEMPT_KEY, '1');
    } catch {
      // Ignore: the redirect still happens.
    }
    const target = window.location.href.replace(/^https?:\/\//, '');
    window.location.href = `intent://${target}#Intent;scheme=https;package=com.android.chrome;end`;
  }

  // Shown on iPhone, or on Android if the page is still here after the Chrome attempt.
  function showBanner() {
    if (document.getElementById('openInBrowserBanner')) return;
    const isAndroid = /Android/i.test(ua);
    const banner = document.createElement('div');
    banner.id = 'openInBrowserBanner';
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'position:fixed;left:12px;right:12px;bottom:84px;z-index:10001;background:#1c392b;color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 12px 30px rgba(0,0,0,.3);font:600 13px/1.5 "Plus Jakarta Sans",sans-serif;';

    const text = document.createElement('p');
    text.style.margin = '0 0 10px';
    text.textContent = isAndroid
      ? 'For the best experience, open this site in Chrome: tap ⋮ (top right) → "Open in Chrome".'
      : 'For the best experience, open this site in Safari: tap ••• (top right) → "Open in external browser".';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;';
    const button = (label, primary) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.textContent = label;
      element.style.cssText = `flex:1;padding:9px 12px;border-radius:10px;border:0;font:700 12px "Plus Jakarta Sans",sans-serif;cursor:pointer;${primary ? 'background:#fff;color:#1c392b;' : 'background:rgba(255,255,255,.15);color:#fff;'}`;
      return element;
    };
    const copy = button('Copy link', true);
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        copy.textContent = 'Link copied ✓';
      } catch {
        copy.textContent = 'Copy failed';
      }
    });
    const close = button('Close', false);
    close.addEventListener('click', () => banner.remove());
    actions.append(copy, close);

    banner.append(text, actions);
    document.body.appendChild(banner);
  }

  const delay = /Android/i.test(ua) && !attempted ? 1500 : 0;
  const start = () => setTimeout(showBanner, delay);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
