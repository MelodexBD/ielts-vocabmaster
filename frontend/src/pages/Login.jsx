import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  updateProfile, sendEmailVerification, sendPasswordResetEmail, getAdditionalUserInfo,
  linkWithCredential, EmailAuthProvider
} from 'firebase/auth';
import { auth, saveUserProfile } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'An account with this email already exists. Please log in.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-credential': 'Incorrect email or password. If you signed up with Google, please use "Continue with Google".',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed.',
  'auth/popup-blocked': 'Your browser blocked the popup. Allow popups and try again.',
  'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.',
  'auth/network-request-failed': 'Please check your internet connection.',
  'auth/provider-already-linked': 'This account already has a password.',
  'auth/credential-already-in-use': 'This email and password are already used by another account.',
  'auth/requires-recent-login': 'For security, please sign in with Google again and then set the password.'
};

function showAuthError(error) {
  console.error(error);
  window.notify(AUTH_ERRORS[error.code] || `Could not sign in (${error.code || error.message}).`);
}

const INPUT = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-forest-600 focus:bg-white focus:ring-2 focus:ring-forest-500/20';
const PRIMARY = 'w-full rounded-xl bg-forest-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-forest-900/20 transition-all hover:bg-forest-700 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80';

function Spinner({ label }) {
  return <span className="inline-flex items-center justify-center gap-2"><i className="fa-solid fa-circle-notch fa-spin"></i><span>{label}</span></span>;
}

function GoogleButton({ loading, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80 sm:text-sm">
      {loading ? <Spinner label="Connecting to Google..." /> : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}

function Divider() {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-grow border-t border-slate-200"></div>
      <span className="mx-3 flex-shrink text-[11px] font-bold uppercase tracking-wider text-slate-400">OR</span>
      <div className="flex-grow border-t border-slate-200"></div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input type={visible ? 'text' : 'password'} id={id} required minLength={6} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} className={`${INPUT} pr-11`} />
      <button type="button" onClick={() => setVisible(show => !show)} aria-label={visible ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
        <i className={`fa-regular ${visible ? 'fa-eye-slash text-forest-600' : 'fa-eye'} text-sm`}></i>
      </button>
    </div>
  );
}

// Shown after Google sign-in when the account has no password yet. The password is linked to the
// same Firebase Auth account (hashed and stored by Firebase, never in our database).
function SetPasswordModal({ email, onSave, onSkip, saving }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const submit = event => {
    event.preventDefault();
    if (password !== confirm) {
      window.notify('The two passwords do not match.');
      return;
    }
    onSave(password);
  };
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-[400px] space-y-4 rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Set a password</h2>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">Add a password to log in with <span className="font-bold text-slate-700">{email}</span> and a password too, not only with Google.</p>
        </div>
        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-xs font-bold text-slate-700">Password<span className="text-rose-500">*</span></label>
          <PasswordInput id="newPassword" value={password} onChange={setPassword} placeholder="At least 6 characters" autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-bold text-slate-700">Confirm password<span className="text-rose-500">*</span></label>
          <PasswordInput id="confirmPassword" value={confirm} onChange={setConfirm} placeholder="Type the password again" autoComplete="new-password" />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onSkip} disabled={saving} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50">Skip</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-forest-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-forest-900/20 transition-all hover:bg-forest-700 disabled:cursor-wait disabled:opacity-80">
            {saving ? <Spinner label="Saving..." /> : 'Save password'}
          </button>
        </div>
      </form>
    </div>
  );
}

function skippedPasswordPrompt(uid) {
  try {
    return localStorage.getItem(`password_prompt_skipped_${uid}`) === '1';
  } catch {
    return false;
  }
}

function TopBar() {
  const [open, setOpen] = useState(false);
  const links = [['fa-house', 'Home'], ['fa-circle-info', 'About'], ['fa-tags', 'Pricing'], ['fa-square-check', 'Mock Test'], ['fa-newspaper', 'Blog'], ['fa-book-bookmark', 'Resources'], ['fa-envelope', 'Contact']];
  return (
    <header className="relative sticky top-0 z-50 border-b border-slate-200 bg-white px-5 py-3.5 shadow-sm md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900">IELTS <span className="text-forest-600">VocabMaster</span></span>
            <span className="ml-1 hidden rounded-md bg-forest-100 px-2 py-0.5 text-[10px] font-bold text-forest-700 sm:inline-block">CAMBRIDGE PREP</span>
          </div>
        </Link>
        <button type="button" onClick={() => setOpen(value => !value)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-all hover:bg-forest-50 hover:text-forest-600 focus:outline-none">
          <i className={open ? 'fa-solid fa-xmark rotate-90 text-lg text-rose-500 transition-transform' : 'fa-solid fa-bars text-lg transition-transform'}></i>
        </button>
      </div>
      <div className={`absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-slate-100 bg-white/95 shadow-2xl backdrop-blur-md transition-all duration-300 ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mx-auto max-w-md space-y-4 px-6 py-5">
          <nav className="space-y-1">
            {links.map(([icon, label]) => (
              <Link key={label} to="/" className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-forest-50 hover:text-forest-600">
                <i className={`fa-solid ${icon} w-5 text-base text-slate-400`}></i>
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500">Looking for help? Feel free to drop a message.</p>
            <a href="tel:+8801757674052" className="mt-1.5 inline-flex items-center gap-2 text-sm font-black text-forest-600 transition-colors hover:text-forest-700">
              <i className="fa-solid fa-phone text-xs"></i>
              <span>+88017-57674052</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Login({ mode }) {
  const navigate = useNavigate();
  const { status, syncProfile } = useAuth();
  // True while this page is signing someone in, so the "already logged in" redirect does not cut the flow short.
  const working = useRef(false);
  const [loading, setLoading] = useState(null);
  const [passwordPrompt, setPasswordPrompt] = useState(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  if (status === 'loading') return null;
  if (status === 'user' && !working.current) return <Navigate to="/" replace />;

  const start = (key, label) => {
    working.current = true;
    setLoading(key);
    window.pageLoader.show(label);
  };
  const fail = error => {
    working.current = false;
    setLoading(null);
    window.pageLoader.hide();
    if (error) showAuthError(error);
  };

  // New accounts get a congratulations message, returning users a login confirmation.
  const goHome = (user, isNewUser, passwordSaved = false) => {
    syncProfile();
    const passwordNote = passwordSaved ? ' Your password is saved, so you can also log in with email and password.' : '';
    if (isNewUser) {
      const greeting = user.displayName ? `, ${user.displayName}` : '';
      window.notify(`🎉 Congratulations${greeting}! Your account has been created.${user.emailVerified ? '' : ' We sent a verification link to your email.'}${passwordNote}`, 'success');
    } else {
      window.notify(`Login successful. Welcome back!${passwordNote}`, 'success');
    }
    window.pageLoader.show('Loading your dashboard...');
    navigate('/', { replace: true });
  };

  const handleLogin = async event => {
    event.preventDefault();
    start('login', 'Logging in...');
    try {
      const { user } = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      goHome(user, false);
    } catch (error) {
      fail(error);
    }
  };

  const showAccountExists = async email => {
    const goToLogin = await window.notify.confirm(
      `An account with ${email} already exists. Please log in instead. If you signed up with Google, use "Continue with Google".`,
      { title: 'Account already exists', confirmText: 'Log in', cancelText: 'Cancel', tone: 'primary' }
    );
    if (!goToLogin) return;
    setLoginEmail(email);
    navigate('/login');
  };

  const handleSignup = async event => {
    event.preventDefault();
    const email = signupEmail.trim();
    start('signup', 'Creating your account...');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, signupPassword);
      // The follow-up steps run in parallel so the home page opens sooner.
      // A failed verification email must not block the sign-up.
      await Promise.all([
        updateProfile(user, { displayName: name.trim() }),
        saveUserProfile(user, { name: name.trim(), createdAt: new Date().toISOString() }),
        sendEmailVerification(user).catch(error => console.error('Verification email could not be sent.', error))
      ]);
      goHome(user, true);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        fail(null);
        await showAccountExists(email);
        return;
      }
      fail(error);
    }
  };

  const handleGoogle = async () => {
    start('google', 'Connecting to Google...');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const isNewUser = !!getAdditionalUserInfo(result)?.isNewUser;
      // Returning users already have a profile, so they go home without waiting for a save.
      if (isNewUser) await saveUserProfile(result.user, { createdAt: new Date().toISOString() });
      const user = result.user;
      const hasPassword = user.providerData.some(provider => provider.providerId === 'password');
      if (!hasPassword && user.email && !skippedPasswordPrompt(user.uid)) {
        window.pageLoader.hide();
        setPasswordPrompt({ user, isNewUser });
        return;
      }
      goHome(user, isNewUser);
    } catch (error) {
      fail(error);
    }
  };

  const savePassword = async password => {
    const { user, isNewUser } = passwordPrompt;
    setLoading('password');
    try {
      await linkWithCredential(user, EmailAuthProvider.credential(user.email, password));
      setPasswordPrompt(null);
      goHome(user, isNewUser, true);
    } catch (error) {
      setLoading('google');
      showAuthError(error);
    }
  };

  const skipPassword = () => {
    const { user, isNewUser } = passwordPrompt;
    try {
      localStorage.setItem(`password_prompt_skipped_${user.uid}`, '1');
    } catch {
      // Without localStorage the prompt simply shows again next time.
    }
    setPasswordPrompt(null);
    goHome(user, isNewUser);
  };

  const handlePasswordReset = async () => {
    const email = loginEmail.trim();
    if (!email) {
      window.notify('Enter your email in the Email field above, then click again.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      window.notify('A password reset link has been sent to your email.', 'success');
    } catch (error) {
      showAuthError(error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f5]">
      <TopBar />
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px] rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-forest-900/5 transition-all sm:p-8">
          {mode === 'login' ? (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Log In</h1>
                <p className="mt-1 text-xs font-medium text-slate-400">Sign in to continue your Cambridge test preparation.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="loginEmail" className="mb-1.5 block text-xs font-bold text-slate-700">Email<span className="text-rose-500">*</span></label>
                  <input type="email" id="loginEmail" required value={loginEmail} onChange={event => setLoginEmail(event.target.value)} placeholder="Enter your email" autoComplete="email" className={INPUT} />
                </div>
                <div>
                  <label htmlFor="loginPassword" className="mb-1.5 block text-xs font-bold text-slate-700">Password<span className="text-rose-500">*</span></label>
                  <PasswordInput id="loginPassword" value={loginPassword} onChange={setLoginPassword} placeholder="Enter your password" autoComplete="current-password" />
                </div>
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-forest-600 focus:ring-forest-500" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={handlePasswordReset} className="font-bold text-forest-600 hover:text-forest-700 hover:underline">Forgot your password?</button>
                </div>
                <button type="submit" disabled={!!loading} className={PRIMARY}>{loading === 'login' ? <Spinner label="Logging in..." /> : 'Login'}</button>
              </form>
              <Divider />
              <GoogleButton loading={loading === 'google' || loading === 'password'} onClick={handleGoogle} />
              <div className="space-y-2.5 border-t border-slate-100 pt-3 text-center">
                <p className="text-xs font-bold text-slate-600">Don't have an account?</p>
                <Link to="/signup" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-forest-600/25 bg-forest-50 py-3.5 text-xs font-extrabold text-forest-800 shadow-sm transition-all hover:border-forest-600 hover:bg-forest-100 hover:text-forest-900 active:scale-[0.99] sm:text-sm">
                  <i className="fa-solid fa-user-plus text-xs text-forest-600"></i>
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Create Account</h1>
                <p className="mt-1 text-xs font-medium text-slate-400">Create your free account and start preparing.</p>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label htmlFor="signupName" className="mb-1.5 block text-xs font-bold text-slate-700">Full Name<span className="text-rose-500">*</span></label>
                  <input type="text" id="signupName" required value={name} onChange={event => setName(event.target.value)} placeholder="Enter your full name " autoComplete="name" className={INPUT} />
                </div>
                <div>
                  <label htmlFor="signupEmail" className="mb-1.5 block text-xs font-bold text-slate-700">Email Address<span className="text-rose-500">*</span></label>
                  <input type="email" id="signupEmail" required value={signupEmail} onChange={event => setSignupEmail(event.target.value)} placeholder="Enter your email" autoComplete="email" className={INPUT} />
                </div>
                <div>
                  <label htmlFor="signupPassword" className="mb-1.5 block text-xs font-bold text-slate-700">Password<span className="text-rose-500">*</span></label>
                  <PasswordInput id="signupPassword" value={signupPassword} onChange={setSignupPassword} placeholder="Create a password (min 6 chars)" autoComplete="new-password" />
                </div>
                <div>
                  <label htmlFor="targetBand" className="mb-1.5 block text-xs font-bold text-slate-700">Target IELTS Band</label>
                  <select id="targetBand" defaultValue="Target Band: 8.0" className={INPUT}>
                    <option>Target Band: 7.0</option>
                    <option>Target Band: 7.5</option>
                    <option>Target Band: 8.0</option>
                    <option>Target Band: 8.5</option>
                    <option>Target Band: 9.0</option>
                  </select>
                </div>
                <button type="submit" disabled={!!loading} className={PRIMARY}>{loading === 'signup' ? <Spinner label="Creating your account..." /> : 'Sign Up'}</button>
              </form>
              <Divider />
              <GoogleButton loading={loading === 'google' || loading === 'password'} onClick={handleGoogle} />
              <div className="space-y-2.5 border-t border-slate-100 pt-3 text-center">
                <p className="text-xs font-bold text-slate-600">Already have an account?</p>
                <Link to="/login" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-forest-600/25 bg-forest-50 py-3.5 text-xs font-extrabold text-forest-800 shadow-sm transition-all hover:border-forest-600 hover:bg-forest-100 hover:text-forest-900 active:scale-[0.99] sm:text-sm">
                  <i className="fa-solid fa-arrow-right-to-bracket text-xs text-forest-600"></i>
                  <span>Log In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        © 2026 IELTS VocabMaster. All rights reserved.
      </footer>

      {passwordPrompt && (
        <SetPasswordModal email={passwordPrompt.user.email} saving={loading === 'password'} onSave={savePassword} onSkip={skipPassword} />
      )}
    </div>
  );
}
