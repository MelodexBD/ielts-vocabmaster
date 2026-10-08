import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import Modals from './Modals';
import { takePricingIntent } from '../lib/authRedirect';

// Page frame for the public site: header, sidebar, page content, footer and mobile navigation.
export default function Layout() {
  const headerRef = useRef(null);
  const { status, userDataReady, isAdmin, isPremium } = useAuth();
  const { closeModal, openPricing } = useUI();
  const { pathname } = useLocation();
  // The footer belongs to the home page only; other pages end with their content.
  const showFooter = pathname === '/';

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

  // A guest who picked a premium plan was sent to log in; once back on this page, show the plans again.
  useEffect(() => {
    if (status === 'user' && userDataReady && !isAdmin && !isPremium && takePricingIntent()) openPricing();
  }, [status, userDataReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen flex-col">
      <Header ref={headerRef} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 md:px-6 md:py-6">
        <Sidebar />
        {/* Without the footer, phones need room so the bottom navigation does not cover the last content. */}
        <main className={`flex w-full min-w-0 flex-1 flex-col ${showFooter ? '' : 'pb-24 md:pb-0'}`}>
          <Outlet />
        </main>
      </div>
      {showFooter && <Footer />}
      <MobileNav />
      <Modals />
    </div>
  );
}
