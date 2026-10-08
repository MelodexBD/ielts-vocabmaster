import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BookList from './pages/BookList';
import BookDetails from './pages/BookDetails';
import Practice from './pages/Practice';
import Plan from './pages/Plan';
import Notifications from './pages/Notifications';
import Login from './pages/Login';

// Only the admin uses this page, so visitors never download its code.
const Admin = lazy(() => import('./pages/Admin'));

// Old static-site links (shared before the move to React) keep working.
function LegacyRedirect({ to }) {
  const { hash } = useLocation();
  const target = to === '/login' && hash === '#signup' ? '/signup' : to;
  return <Navigate to={target} replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books/:module" element={<BookList />} />
          <Route path="/books/:module/:bookNumber" element={<BookDetails />} />
          <Route path="/practice/:module" element={<Practice />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route path="/login" element={<Login mode="login" />} />
        <Route path="/signup" element={<Login mode="signup" />} />
        <Route path="/admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
        <Route path="/index.html" element={<LegacyRedirect to="/" />} />
        <Route path="/signup.html" element={<LegacyRedirect to="/login" />} />
        <Route path="/admin.html" element={<LegacyRedirect to="/admin" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
