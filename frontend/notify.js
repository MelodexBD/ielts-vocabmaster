// Toast notifications shared by all pages: notify(message, type).
// type: 'error' (default), 'warning', 'success' or 'info'.
// notify.later(message, type) shows the toast on the next page, for messages followed by a redirect.
(function () {
  const STYLES = {
    error: { bg: '#dc2626', border: '#b91c1c', text: '#ffffff', icon: '⚠', iconBg: '#ffffff', iconText: '#dc2626' },
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
    icon.style.cssText = `flex-shrink:0;width:20px;height:20px;border-radius:50%;background:${style.iconBg || style.text};color:${style.iconText || '#fff'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;`;

    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'flex:1;white-space:pre-line;';

    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
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

  // Styled replacement for window.confirm(); resolves to true when confirmed.
  notify.confirm = function (message, { title = 'Please confirm', confirmText = 'Yes', cancelText = 'Cancel' } = {}) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .15s;';

      const dialog = document.createElement('div');
      dialog.setAttribute('role', 'alertdialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.style.cssText = 'width:min(380px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 20px 50px rgba(15,23,42,.25);font-family:inherit;';

      const heading = document.createElement('h2');
      heading.textContent = title;
      heading.style.cssText = 'margin:0 0 8px;font-size:17px;font-weight:800;color:#0f172a;';

      const text = document.createElement('p');
      text.textContent = message;
      text.style.cssText = 'margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;';

      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;';

      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.textContent = cancelText;
      cancel.style.cssText = 'padding:10px 18px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;color:#334155;font-size:13px;font-weight:700;cursor:pointer;';

      const ok = document.createElement('button');
      ok.type = 'button';
      ok.textContent = confirmText;
      ok.style.cssText = 'padding:10px 18px;border-radius:12px;border:0;background:#dc2626;color:#fff;font-size:13px;font-weight:700;cursor:pointer;';

      const finish = result => {
        document.removeEventListener('keydown', onKey);
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 150);
        resolve(result);
      };
      const onKey = event => {
        if (event.key === 'Escape') finish(false);
      };
      cancel.addEventListener('click', () => finish(false));
      ok.addEventListener('click', () => finish(true));
      overlay.addEventListener('click', event => {
        if (event.target === overlay) finish(false);
      });
      document.addEventListener('keydown', onKey);

      actions.append(cancel, ok);
      dialog.append(heading, text, actions);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });
      ok.focus();
    });
  };

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
