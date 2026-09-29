import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('arjun.kapoor@lendy.finance');
  const [password, setPassword] = useState('Lendy@Demo2026!');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'loan_officer' | 'underwriter' | 'admin'>('underwriter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-redirect if already authenticated
  React.useEffect(() => {
    if (!authLoading && user) {
      const destination = (location.state as any)?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const demoRoles = [
    {
      id: 'underwriter',
      name: 'Arjun Kapoor',
      role: 'Lead Underwriter',
      email: 'arjun.kapoor@lendy.finance',
    },
    {
      id: 'loan_officer',
      name: 'Sunita Rao',
      role: 'Senior Loan Officer',
      email: 'sunita.rao@lendy.finance',
    },
    {
      id: 'admin',
      name: 'Devon Patel',
      role: 'Risk & Compliance Officer',
      email: 'devon.patel@lendy.finance',
    },
  ];

  const handleSelectDemo = (demoEmail: string) => {
    setMode('signin');
    setEmail(demoEmail);
    setPassword('Lendy@Demo2026!');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.success) {
          const destination = (location.state as any)?.from?.pathname || '/';
          navigate(destination, { replace: true });
        } else {
          setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
        }
      } else {
        const result = await signUp(email, password, name || email.split('@')[0], role);
        if (result.success) {
          const destination = (location.state as any)?.from?.pathname || '/';
          navigate(destination, { replace: true });
        } else {
          setErrorMsg(result.error || 'Account creation failed.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Mode Toggle: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); }}
            className={`py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Staff Role (public.users)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="underwriter">Lead Underwriter (Decision Authority)</option>
                  <option value="loan_officer">Senior Loan Officer (Intake & Uploads)</option>
                  <option value="admin">Risk & Compliance Admin (Full Privileges)</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@lendy.finance"
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          {mode === 'signin' && (
            <div className="pt-2 space-y-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Quick Fill Synthetic Demo Profiles
              </label>
              <div className="space-y-1.5">
                {demoRoles.map((r) => {
                  const isSelected = email.toLowerCase() === r.email.toLowerCase();
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleSelectDemo(r.email)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{r.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{r.email}</div>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded font-semibold">
                        {r.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting
              ? 'Authenticating with Supabase...'
              : mode === 'signin'
              ? 'Access Underwriting Workspace'
              : 'Create Supabase Account'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Supabase Auth · Session Management & Role-Based Access
        </div>
      </div>
    </div>
  );
};
