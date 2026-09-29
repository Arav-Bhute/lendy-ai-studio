import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, ShieldCheck, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Applications', path: '/applications' },
    { label: 'Policies', path: '/policies' },
    { label: 'Audit Trail', path: '/audit-trail' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Zone 1: Single text element wordmark */}
      <Link to="/" className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
        <span>Lendy</span>
        <span className="text-xs font-normal text-slate-400">· Underwriting Copilot</span>
      </Link>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`transition-colors whitespace-nowrap ${
              isActive(link.path)
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-4 pt-4 -mb-4'
                : 'hover:text-slate-900'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50">
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium text-slate-800">Arjun Kapoor</span>
          <span className="text-slate-400">· Lead Underwriter</span>
        </div>

        <Link
          to="/applications/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Application</span>
        </Link>
      </div>
    </header>
  );
};
