import { Outlet } from 'react-router';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
