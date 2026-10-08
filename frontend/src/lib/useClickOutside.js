import { useEffect } from 'react';

// Calls onOutside when a click lands outside the given element (used to close dropdown menus).
export default function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return undefined;
    const handle = event => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, [ref, onOutside, active]);
}
