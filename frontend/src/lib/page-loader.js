// Full-screen loading screen shared by the login page and the home page.
// pageLoader.show(message) / pageLoader.hide(); pageLoader.carryOver(message) keeps it up across a page change.
// Loaded in <head>, so the screen can appear before the rest of the page is drawn.
(function () {
  const CARRY_KEY = 'page_loader_message';
  const LOADER_ID = 'pageLoader';

  const style = document.createElement('style');
  style.textContent = `
    #${LOADER_ID} { position: fixed; inset: 0; z-index: 100000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; background: #f4f7f5; transition: opacity .25s ease; font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif; }
    #${LOADER_ID}.page-loader-hiding { opacity: 0; pointer-events: none; }
    #${LOADER_ID} .page-loader-brand { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }
    #${LOADER_ID} .page-loader-brand span { color: #2d5a43; }
    #${LOADER_ID} .page-loader-spinner { width: 42px; height: 42px; border-radius: 50%; border: 4px solid #c5dcd0; border-top-color: #2d5a43; animation: page-loader-spin .8s linear infinite; }
    #${LOADER_ID} .page-loader-text { font-size: 13px; font-weight: 700; color: #475569; }
    @keyframes page-loader-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  function show(message = 'Loading...') {
    let loader = document.getElementById(LOADER_ID);
    if (!loader) {
      loader = document.createElement('div');
      loader.id = LOADER_ID;
      loader.setAttribute('role', 'status');
      loader.setAttribute('aria-live', 'polite');
      loader.innerHTML = '<div class="page-loader-brand">IELTS <span>VocabMaster</span></div><div class="page-loader-spinner"></div><div class="page-loader-text"></div>';
      // Before <body> exists the screen is attached to <html>, so it still covers the page.
      (document.body || document.documentElement).appendChild(loader);
    }
    loader.classList.remove('page-loader-hiding');
    loader.querySelector('.page-loader-text').textContent = message;
  }

  function hide() {
    const loader = document.getElementById(LOADER_ID);
    if (!loader) return;
    loader.classList.add('page-loader-hiding');
    setTimeout(() => loader.remove(), 250);
  }

  function carryOver(message) {
    try {
      sessionStorage.setItem(CARRY_KEY, message);
    } catch {
      // Without sessionStorage the next page simply opens without the loading screen.
    }
  }

  // Coming from the login page: show the loading screen right away on this page too.
  try {
    const carried = sessionStorage.getItem(CARRY_KEY);
    if (carried) {
      sessionStorage.removeItem(CARRY_KEY);
      show(carried);
      // Never leave the screen up if the page fails to finish loading.
      setTimeout(hide, 8000);
    }
  } catch {
    // Ignore unreadable sessionStorage.
  }

  window.pageLoader = { show, hide, carryOver };
})();
