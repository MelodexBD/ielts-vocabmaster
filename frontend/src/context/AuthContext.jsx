import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { auth, getPhotoUrl, isAdminUser, loadUserData, savePlanDone, saveProgress } from '../lib/firebase';
import { ADMIN_EMAIL, TESTS } from '../lib/data';

const AuthContext = createContext(null);

function isAdminEmail(email) {
  return (email || '').trim().toLowerCase() === ADMIN_EMAIL;
}

function toProfile(user) {
  if (!user) return null;
  const email = user.email || '';
  return {
    uid: user.uid,
    email,
    name: user.displayName || email.split('@')[0] || 'User',
    photoUrl: getPhotoUrl(user),
    emailVerified: user.emailVerified
  };
}

// Login state for the whole app. status: 'loading' until Firebase answers, then 'guest' or 'user'.
// userDataReady turns true once the user's progress and premium status are loaded.
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // Premium from the account (premium: true, optional end date). It switches off by itself at the end date.
  const [premiumGrant, setPremiumGrant] = useState({ active: false, until: null });
  const [clock, setClock] = useState(() => Date.now());
  const [progress, setProgress] = useState({});
  const [planDone, setPlanDone] = useState([]);
  const [userDataReady, setUserDataReady] = useState(false);

  // If Firebase cannot answer (offline, blocked), show the guest view after a few seconds
  // instead of an empty page; the real state still replaces it as soon as it arrives.
  const statusRef = useRef(status);
  statusRef.current = status;
  useEffect(() => {
    const fallback = setTimeout(() => {
      if (statusRef.current !== 'loading') return;
      setStatus('guest');
      setUserDataReady(true);
    }, 4000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => onAuthStateChanged(auth, async signedInUser => {
    let user = signedInUser;
    // The admin email may have been verified (link clicked) since the last login. Firebase only
    // notices after a reload, and Firestore rules only after a fresh token.
    if (user && isAdminEmail(user.email) && !user.emailVerified) {
      try {
        await user.reload();
        user = auth.currentUser || user;
        if (user.emailVerified) await user.getIdToken(true);
      } catch (error) {
        console.warn('Could not refresh the admin verification status.', error);
      }
    }
    setProfile(toProfile(user));
    setIsAdmin(isAdminUser(user));
    if (!user) {
      setStatus('guest');
      setPremiumGrant({ active: false, until: null });
      setProgress({});
      setPlanDone([]);
      setUserDataReady(true);
      return;
    }
    setStatus('user');
    setUserDataReady(false);
    try {
      const data = await loadUserData(user.uid);
      setProgress(data.progress);
      setPlanDone(data.planDone);
      setClock(Date.now());
      setPremiumGrant({ active: data.premium && !isAdminUser(user), until: data.premiumUntil });
    } catch (error) {
      console.error('Progress could not be loaded from the cloud.', error);
      window.notify('Could not load your progress. Try refreshing the page.');
    } finally {
      setUserDataReady(true);
    }
  }), []);

  const premiumEnd = premiumGrant.active && premiumGrant.until ? premiumGrant.until.getTime() : null;
  const isPremium = premiumGrant.active && (premiumEnd === null || premiumEnd > clock);
  useEffect(() => {
    if (premiumEnd === null || premiumEnd <= clock) return undefined;
    // Timers cannot wait longer than about 24 days; a longer wait simply checks again then.
    const timer = setTimeout(() => setClock(Date.now()), Math.min(premiumEnd - clock + 1000, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [premiumEnd, clock]);

  // Picks up profile changes (e.g. the name set right after sign-up), which Firebase does not announce.
  const syncProfile = useCallback(() => {
    setProfile(toProfile(auth.currentUser));
    setIsAdmin(isAdminUser(auth.currentUser));
  }, []);

  const completedTests = useCallback(moduleName => {
    const tests = progress[moduleName];
    return Array.isArray(tests) ? [...new Set(tests.filter(test => TESTS.includes(test)))] : [];
  }, [progress]);

  const toggleTestCompletion = useCallback((moduleName, test) => {
    const tests = completedTests(moduleName);
    const next = {
      ...progress,
      [moduleName]: tests.includes(test) ? tests.filter(item => item !== test) : [...tests, test]
    };
    setProgress(next);
    if (auth.currentUser) {
      saveProgress(auth.currentUser.uid, next).catch(error => {
        console.error('Progress could not be saved to the cloud.', error);
        window.notify('Could not save your progress. Check your internet connection.');
      });
    }
  }, [progress, completedTests]);

  // Days of the study plan the student has marked as done (saved to their account).
  const togglePlanDay = useCallback(day => {
    const next = planDone.includes(day) ? planDone.filter(item => item !== day) : [...planDone, day].sort((a, b) => a - b);
    setPlanDone(next);
    if (auth.currentUser) {
      savePlanDone(auth.currentUser.uid, next).catch(error => {
        console.error('Study plan could not be saved to the cloud.', error);
        window.notify('Could not save your study plan. Check your internet connection.');
      });
    }
  }, [planDone]);

  // Logged in with the admin email but not verified yet: the admin panel stays locked until the
  // verification link is clicked (or the admin signs in with Google, which counts as verified).
  const needsAdminVerification = !!profile && isAdminEmail(profile.email) && !profile.emailVerified;

  const sendAdminVerification = useCallback(async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      window.notify(`Verification email sent to ${auth.currentUser.email}. Click the link in it, then refresh this page to open the Admin panel.`, 'success');
    } catch (error) {
      console.error('Verification email could not be sent.', error);
      window.notify(error.code === 'auth/too-many-requests'
        ? 'A verification email was sent recently. Please check your inbox (and Spam) or try again later.'
        : 'Could not send the verification email. Check your internet connection and try again.');
    }
  }, []);

  const value = useMemo(() => ({
    status,
    isLoggedIn: status === 'user',
    profile,
    isAdmin,
    needsAdminVerification,
    sendAdminVerification,
    isPremium,
    premiumUntil: isPremium ? premiumGrant.until : null,
    hasFullAccess: isAdmin || isPremium,
    userDataReady,
    completedTests,
    toggleTestCompletion,
    planDone,
    togglePlanDay,
    syncProfile
  }), [status, profile, isAdmin, needsAdminVerification, sendAdminVerification, isPremium, premiumGrant.until, userDataReady, completedTests, toggleTestCompletion, planDone, togglePlanDay, syncProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
