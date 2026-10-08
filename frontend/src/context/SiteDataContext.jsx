import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchSiteData, readSiteCache, writeSiteCache } from '../lib/firebase';
import { DEFAULT_BOOK_RANGE, defaultBanners, initialVocabulary } from '../lib/data';

const SiteDataContext = createContext(null);

const EMPTY = { bookRange: null, moduleSections: {}, banners: [], content: [], notifications: [] };

function validRange(range) {
  return range && Number.isInteger(range.start) && Number.isInteger(range.end) &&
    range.start >= 1 && range.end <= 99 && range.start <= range.end
    ? range
    : DEFAULT_BOOK_RANGE;
}

// Public site content managed from the admin panel (book range, banners, home sections,
// vocabulary, module content and notifications). Shows the cached copy first, then the latest from Firestore.
export function SiteDataProvider({ children }) {
  const [data, setData] = useState(() => readSiteCache() || EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSiteData()
      .then(fresh => {
        if (!active) return;
        setData(fresh);
        writeSiteCache(fresh);
      })
      .catch(error => {
        console.error('Site content could not be loaded from Firestore.', error);
        window.notify('Could not load new content. Check your internet connection and refresh the page.');
      })
      .finally(() => active && setLoaded(true));
    return () => { active = false; };
  }, []);

  // Used by the admin panel after a successful save, so the change shows without reloading.
  const updateData = useCallback(changes => {
    setData(current => {
      const next = { ...current, ...(typeof changes === 'function' ? changes(current) : changes) };
      writeSiteCache(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    loaded,
    raw: data,
    bookRange: validRange(data.bookRange),
    moduleSections: data.moduleSections || {},
    // Empty collections fall back to the built-in defaults, as before.
    banners: data.banners?.length ? data.banners : defaultBanners,
    vocabulary: data.content?.length ? data.content : initialVocabulary,
    content: data.content || [],
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    updateData
  }), [data, loaded, updateData]);

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  return useContext(SiteDataContext);
}
