import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { auth, getPhotoUrl, isAdminUser, loadUserData, saveProgress } from '../lib/firebase';
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
  const [isPremium, setIsPremium] = useState(false);
  const [progress, setProgress] = useState({});
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
      setIsPremium(false);
      setProgress({});
      setUserDataReady(true);
      return;
    }
    setStatus('user');
    setUserDataReady(false);
    try {
      const data = await loadUserData(user.uid);
      setProgress(data.progress);
      setIsPremium(data.premium && !isAdminUser(user));
    } catch (error) {
      console.error('Progress could not be loaded from the cloud.', error);
      window.notify('Could not load your progress. Try refreshing the page.');
    } finally {
      setUserDataReady(true);
    }
  }), []);

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
    hasFullAccess: isAdmin || isPremium,
    userDataReady,
    completedTests,
    toggleTestCompletion,
    syncProfile
  }), [status, profile, isAdmin, needsAdminVerification, sendAdminVerification, isPremium, userDataReady, completedTests, toggleTestCompletion, syncProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
