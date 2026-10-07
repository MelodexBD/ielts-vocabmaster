// Toast notifications shared by all pages: notify(message, type).
// type: 'error' (default), 'warning', 'success' or 'info'.
// notify.later(message, type) shows the toast on the next page, for messages followed by a redirect.
(function () {
  const STYLES = {
    error: { bg: '#fef2f2', border: '#fecaca', text: '#9f1239', icon: '⚠' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '!' },
    success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', icon: '✓' },
    info: { bg: '#f8fafc', border: '#cbd5e1', text: '#1e293b', icon: 'i' }
  };
  const QUEUE_KEY = 'pending_toast';

  function getContainer() {
    let container = document.getElementById('notifyContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notifyContainer';
      container.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;width:min(420px,calc(100vw - 32px));pointer-events:none;';
      document.body.appendChild(container);
    }
    return container;
  }

  function notify(message, type = 'error', duration) {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => notify(message, type, duration), { once: true });
      return;
    }
    const style = STYLES[type] || STYLES.error;
    const toast = document.createElement('div');
    toast.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
    toast.style.cssText = `pointer-events:auto;display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:14px;border:1px solid ${style.border};background:${style.bg};color:${style.text};box-shadow:0 10px 30px rgba(15,23,42,.15);font-size:13px;font-weight:600;line-height:1.5;opacity:0;transform:translateY(-8px);transition:opacity .2s,transform .2s;`;

    const icon = document.createElement('span');
    icon.textContent = style.icon;
    icon.style.cssText = `flex-shrink:0;width:20px;height:20px;border-radius:50%;background:${style.text};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;`;

    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'flex:1;white-space:pre-line;';

    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'বন্ধ করুন');
    close.textContent = '×';
    close.style.cssText = `flex-shrink:0;border:0;background:none;color:${style.text};font-size:18px;line-height:1;cursor:pointer;padding:0 2px;`;

    const dismiss = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(() => toast.remove(), 200);
    };
    close.addEventListener('click', dismiss);

    toast.append(icon, text, close);
    getContainer().appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    setTimeout(dismiss, duration || (type === 'error' || type === 'warning' ? 6000 : 3500));
  }

  notify.later = function (message, type = 'error') {
    try {
      sessionStorage.setItem(QUEUE_KEY, JSON.stringify({ message, type }));
    } catch {
      // Without sessionStorage the message is simply not carried over.
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    try {
      const pending = JSON.parse(sessionStorage.getItem(QUEUE_KEY) || 'null');
      sessionStorage.removeItem(QUEUE_KEY);
      if (pending && pending.message) notify(pending.message, pending.type);
    } catch {
      // Ignore unreadable queued messages.
    }
  });

  window.notify = notify;
})();
