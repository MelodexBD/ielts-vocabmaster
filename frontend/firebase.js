// Firebase setup shared by index.html, admin.html and signup.html.
// The pages still read their data from the same localStorage keys as before;
// this module fills those keys from Firestore and writes changes back to Firestore.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, getDocs, addDoc, deleteDoc, collection, query, orderBy, writeBatch
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA2P4dyiCvl5Y04shWS84QeNZpsdmydWCY',
  authDomain: 'ielts-vocab-master-c1a7a.firebaseapp.com',
  projectId: 'ielts-vocab-master-c1a7a',
  storageBucket: 'ielts-vocab-master-c1a7a.firebasestorage.app',
  messagingSenderId: '6565421922',
  appId: '1:6565421922:web:de8654b8b26a9a6896c23b',
  measurementId: 'G-WZJCRWPXBN'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_EMAIL = 'ieltsvocabmaster@gmail.com';

const CACHE_KEYS = {
  bookRange: 'cambridge_book_range',
  moduleSections: 'site_module_sections_db',
  banners: 'site_banners_db',
  content: 'user_vocab_db',
  progress: 'module_test_progress'
};

// Firestore is the source of truth; a failed cache write must never fail a save.
function cacheSet(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Local cache ${key} could not be updated.`, error);
  }
}

function cacheGetArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function isAdmin(user) {
  return !!user && user.emailVerified && (user.email || '').trim().toLowerCase() === ADMIN_EMAIL;
}

export function waitForUser() {
  return new Promise(resolve => {
    const stop = onAuthStateChanged(auth, user => {
      stop();
      resolve(user);
    });
  });
}

// Keeps the old localStorage login keys in step with Firebase Auth.
// Returns true when they changed, so the page can re-render its header.
export function mirrorUser(user) {
  const before = [localStorage.getItem('user_auth_token'), localStorage.getItem('user_name'), localStorage.getItem('user_email')];
  if (user) {
    const email = user.email || '';
    localStorage.setItem('user_auth_token', 'firebase');
    localStorage.setItem('user_name', user.displayName || email.split('@')[0] || 'User');
    localStorage.setItem('user_email', email);
  } else {
    localStorage.removeItem('user_auth_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
  }
  const after = [localStorage.getItem('user_auth_token'), localStorage.getItem('user_name'), localStorage.getItem('user_email')];
  return before.some((value, index) => value !== after[index]);
}

export async function logOut() {
  await signOut(auth);
  mirrorUser(null);
  cacheSet(CACHE_KEYS.progress, null);
}

// Loads all public site content into the localStorage cache.
// Empty collections clear the cache key so the pages fall back to their built-in defaults.
export async function pullSiteData() {
  // One-time copy of data saved before Firebase (browser-only), so the first sync never destroys it.
  if (!localStorage.getItem('pre_firebase_backup_done')) {
    [CACHE_KEYS.bookRange, CACHE_KEYS.moduleSections, CACHE_KEYS.banners, CACHE_KEYS.content].forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          localStorage.setItem(`pre_firebase_${key}`, value);
        } catch (error) {
          console.warn(`Backup of ${key} could not be saved.`, error);
        }
      }
    });
    localStorage.setItem('pre_firebase_backup_done', '1');
  }
  const [rangeSnap, sectionsSnap, bannersSnap, contentSnap] = await Promise.all([
    getDoc(doc(db, 'site', 'bookRange')),
    getDoc(doc(db, 'site', 'moduleSections')),
    getDocs(query(collection(db, 'banners'), orderBy('createdAt', 'desc'))),
    getDocs(query(collection(db, 'content'), orderBy('createdAt', 'desc')))
  ]);
  cacheSet(CACHE_KEYS.bookRange, rangeSnap.exists() ? rangeSnap.data() : null);
  cacheSet(CACHE_KEYS.moduleSections, sectionsSnap.exists() ? sectionsSnap.data() : null);
  const banners = bannersSnap.docs.map(snap => ({ ...snap.data(), id: snap.id }));
  cacheSet(CACHE_KEYS.banners, banners.length ? banners : null);
  const content = contentSnap.docs.map(snap => ({ ...snap.data(), id: snap.id }));
  cacheSet(CACHE_KEYS.content, content.length ? content : null);
}

export async function loadProgress(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  const progress = snap.exists() && snap.data().progress && typeof snap.data().progress === 'object' ? snap.data().progress : {};
  cacheSet(CACHE_KEYS.progress, progress);
  return progress;
}

export async function saveProgress(uid, progress) {
  await setDoc(doc(db, 'users', uid), { progress }, { merge: true });
}

export async function saveUserProfile(user, extra = {}) {
  await setDoc(doc(db, 'users', user.uid), {
    name: user.displayName || '',
    email: user.email || '',
    ...extra
  }, { merge: true });
}

// ---------- Admin writes (allowed only for the admin by firestore.rules) ----------

export async function saveBookRange(range) {
  await setDoc(doc(db, 'site', 'bookRange'), range);
  cacheSet(CACHE_KEYS.bookRange, range);
}

export async function saveModuleSections(sections) {
  await setDoc(doc(db, 'site', 'moduleSections'), sections);
  cacheSet(CACHE_KEYS.moduleSections, sections);
}

export async function addBanner(banner) {
  const record = { ...banner, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, 'banners'), record);
  cacheSet(CACHE_KEYS.banners, [{ ...record, id: ref.id }, ...cacheGetArray(CACHE_KEYS.banners)]);
}

export async function deleteBanner(id) {
  await deleteDoc(doc(db, 'banners', id));
  const remaining = cacheGetArray(CACHE_KEYS.banners).filter(banner => banner.id !== id);
  cacheSet(CACHE_KEYS.banners, remaining.length ? remaining : null);
}

export async function addContent(records) {
  const createdAt = new Date().toISOString();
  const saved = [];
  // A Firestore batch holds at most 500 writes.
  for (let start = 0; start < records.length; start += 400) {
    const batch = writeBatch(db);
    records.slice(start, start + 400).forEach(record => {
      const ref = doc(collection(db, 'content'));
      const data = { ...record, createdAt: record.createdAt || createdAt };
      batch.set(ref, data);
      saved.push({ ...data, id: ref.id });
    });
    await batch.commit();
  }
  cacheSet(CACHE_KEYS.content, [...saved, ...cacheGetArray(CACHE_KEYS.content)]);
}
