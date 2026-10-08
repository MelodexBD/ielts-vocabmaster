import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import Modals from './Modals';

// Page frame for the public site: header, sidebar, page content, footer and mobile navigation.
export default function Layout() {
  const headerRef = useRef(null);
  const { status, userDataReady } = useAuth();
  const { closeModal } = useUI();
  const { pathname } = useLocation();

  // Sticky bars (e.g. the T1–T4 test bar) sit just below the header, whose height varies by screen.
  useEffect(() => {
    const update = () => {
      if (headerRef.current) document.documentElement.style.setProperty('--header-height', `${headerRef.current.offsetHeight}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [status]);

  // The loading screen shown after logging in is removed once the user's data is ready.
  useEffect(() => {
    if (status !== 'loading' && userDataReady) window.pageLoader.hide();
  }, [status, userDataReady]);

  // Popups belong to the page they were opened on (also closes them on the Back button).
  useEffect(() => {
    closeModal();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen flex-col">
      <Header ref={headerRef} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 md:px-6 md:py-6">
        <Sidebar />
        <main className="flex w-full min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <Footer />
      <MobileNav />
      <Modals />
    </div>
  );
}
