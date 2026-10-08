// Firebase connection and every read/write the site makes.
// Firestore security rules live in backend/firestore.rules.
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, getDocs, addDoc, deleteDoc, collection, query, orderBy, limit, writeBatch
} from 'firebase/firestore';
import { ADMIN_EMAIL } from './data';

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

export function isAdminUser(user) {
  return !!user && user.emailVerified && (user.email || '').trim().toLowerCase() === ADMIN_EMAIL;
}

// Google accounts carry a photo. If the account was created with a password and Google
// was linked later, the photo is only on the Google provider entry.
export function getPhotoUrl(user) {
  if (!user) return '';
  return user.photoURL || (user.providerData || []).map(provider => provider.photoURL).find(Boolean) || '';
}

export function logOut() {
  return signOut(auth);
}

// ---------- Public site content ----------

const SITE_CACHE_KEY = 'site_content_cache_v2';

// Last loaded site content, so pages can render instantly before Firestore answers.
export function readSiteCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(SITE_CACHE_KEY) || 'null');
    return cached && typeof cached === 'object' ? cached : null;
  } catch {
    return null;
  }
}

export function writeSiteCache(data) {
  try {
    localStorage.setItem(SITE_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    // Large banner images can exceed the storage quota; the site still works without the cache.
    console.warn('Site content cache could not be saved.', error);
  }
}

export async function fetchSiteData() {
  const [rangeSnap, sectionsSnap, bannersSnap, contentSnap, notificationDocs] = await Promise.all([
    getDoc(doc(db, 'site', 'bookRange')),
    getDoc(doc(db, 'site', 'moduleSections')),
    getDocs(query(collection(db, 'banners'), orderBy('createdAt', 'desc'))),
    getDocs(query(collection(db, 'content'), orderBy('createdAt', 'desc'))),
    fetchNotifications()
  ]);
  return {
    bookRange: rangeSnap.exists() ? rangeSnap.data() : null,
    moduleSections: sectionsSnap.exists() ? sectionsSnap.data() : {},
    banners: bannersSnap.docs.map(snap => ({ ...snap.data(), id: snap.id })),
    content: contentSnap.docs.map(snap => ({ ...snap.data(), id: snap.id })),
    notifications: notificationDocs
  };
}

// Daily notices from the admin, newest first. A failure here (e.g. rules not published yet)
// must not stop the rest of the site content from loading.
async function fetchNotifications() {
  try {
    const snap = await getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(30)));
    return snap.docs.map(item => ({ ...item.data(), id: item.id }));
  } catch (error) {
    console.warn('Notifications could not be loaded.', error);
    return [];
  }
}

// ---------- Per-user data ----------

// Progress, study plan days done and premium status (premium can only be set by the admin, see firestore.rules).
export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.exists() ? snap.data() : {};
  const progress = data.progress && typeof data.progress === 'object' ? data.progress : {};
  const planDone = Array.isArray(data.planDone) ? data.planDone.filter(Number.isInteger) : [];
  return { progress, planDone, premium: data.premium === true };
}

export function saveProgress(uid, progress) {
  return setDoc(doc(db, 'users', uid), { progress }, { merge: true });
}

export function savePlanDone(uid, planDone) {
  return setDoc(doc(db, 'users', uid), { planDone }, { merge: true });
}

export function saveUserProfile(user, extra = {}) {
  return setDoc(doc(db, 'users', user.uid), {
    name: user.displayName || '',
    email: user.email || '',
    ...extra
  }, { merge: true });
}

// ---------- Admin writes (allowed only for the admin by firestore.rules) ----------

export function saveBookRange(range) {
  return setDoc(doc(db, 'site', 'bookRange'), range);
}

export function saveModuleSections(sections) {
  return setDoc(doc(db, 'site', 'moduleSections'), sections);
}

export async function addBanner(banner) {
  const record = { ...banner, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, 'banners'), record);
  return { ...record, id: ref.id };
}

export function deleteBanner(id) {
  return deleteDoc(doc(db, 'banners', id));
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
  return saved;
}

export async function addNotification(notification) {
  const record = { ...notification, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, 'notifications'), record);
  return { ...record, id: ref.id };
}

export function deleteNotification(id) {
  return deleteDoc(doc(db, 'notifications', id));
}
