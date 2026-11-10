import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';
import ScrollToTop from './ScrollToTop.tsx';

export default function Layout() {
  const { pathname } = useLocation();
  const [navigationState, setNavigationState] = useState(() => ({
    initialPathname: pathname,
    hasNavigated: false,
  }));
  if (!navigationState.hasNavigated && pathname !== navigationState.initialPathname) {
    setNavigationState({ ...navigationState, hasNavigated: true });
  }
  const showInitialHomeLoader =
    navigationState.initialPathname === '/' && !navigationState.hasNavigated;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet
          context={showInitialHomeLoader}
        />
      </main>
      <Footer />
    </div>
  );
}
