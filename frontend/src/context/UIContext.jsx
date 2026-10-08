import { createContext, useContext, useMemo, useState } from 'react';

const UIContext = createContext(null);

// Shared popups (pricing, "log in to unlock") and the book/test the visitor last opened,
// which the module practice pages use to show uploaded content for that test.
export function UIProvider({ children }) {
  const [modal, setModal] = useState(null);
  const [selection, setSelection] = useState({ book: 'Cambridge 10', test: 'T1' });

  const value = useMemo(() => ({
    modal,
    openPricing: () => setModal('pricing'),
    openAuthPrompt: () => setModal('authPrompt'),
    closeModal: () => setModal(null),
    selection,
    setSelection
  }), [modal, selection]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  return useContext(UIContext);
}
