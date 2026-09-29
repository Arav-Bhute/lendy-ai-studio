import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: Array<'loan_officer' | 'underwriter' | 'admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-medium font-mono">
            Verifying Supabase Session...
          </span>
        </div>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!user && !session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce role-based access if specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600">
          Your role (<strong className="font-mono">{user.role}</strong>) does not have authorization to view this section.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
