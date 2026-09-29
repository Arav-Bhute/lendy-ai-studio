import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'underwriter' | 'loan_officer' | 'admin'>('underwriter');

  const roles = [
    { id: 'underwriter', name: 'Arjun Kapoor', role: 'Lead Underwriter', email: 'arjun.kapoor@lendy.finance' },
    { id: 'loan_officer', name: 'Sunita Rao', role: 'Senior Loan Officer', email: 'sunita.rao@lendy.finance' },
    { id: 'admin', name: 'Devon Patel', role: 'Risk & Compliance Officer', email: 'devon.patel@lendy.finance' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lendy Underwriting Portal
          </h1>
          <p className="text-xs text-slate-500">
            Explainable AI Copilot for Commercial & Retail Credit Risk
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Select Demo Officer Profile
            </label>
            <div className="space-y-2">
              {roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id as any)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedRole === r.id
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{r.name}</div>
                    <div className="text-[11px] text-slate-500">{r.email}</div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded font-semibold">
                    {r.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Access Underwriting Workspace
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Built for Bank Loan Officers, Credit Analysts & Risk Teams
        </div>
      </div>
    </div>
  );
};
