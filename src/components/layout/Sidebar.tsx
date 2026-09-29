import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus2,
  ShieldAlert,
  History,
  FileCheck2,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Borrower Applications', icon: FolderKanban },
    { to: '/applications/new', label: 'New Loan Intake', icon: FilePlus2 },
    { to: '/policies', label: 'Policy Engine Rules', icon: ShieldAlert },
    { to: '/audit-trail', label: 'Compliance Audit Trail', icon: History },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Navigation */}
      <div className="p-4 space-y-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2 font-semibold">
            Underwriting Workspace
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Underwriting Guide / Principles */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Human-in-the-Loop Standard</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Lendy functions as an advisory copilot. Final lending decisions, policy waivers, and sanction orders require authorized officer sign-off.
          </p>
        </div>
      </div>

      {/* Model & System Status */}
      <div className="p-4 border-t border-slate-200 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-500 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-emerald-600" />
            <span>Gemini 3.8 Flash</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
            CONNECTED
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          Deterministic Financial Engine v2.4
        </div>
      </div>
    </aside>
  );
};
