import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FileCheck,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { api } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import type { LoanApplication, AuditLog } from '../types';

export const Dashboard: React.FC = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [apps, logs] = await Promise.all([
          api.getApplications(),
          api.getAllActivity(),
        ]);
        setApplications(apps);
        setActivities(logs.slice(0, 7));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalApps = applications.length;
  const underReviewCount = applications.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'NEEDS_REVIEW').length;
  const pendingDocsCount = applications.filter(a => a.status === 'PENDING_DOCUMENTS').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;

  const lowRiskCount = applications.filter(a => a.overallRisk === 'LOW').length;
  const medRiskCount = applications.filter(a => a.overallRisk === 'MEDIUM').length;
  const highRiskCount = applications.filter(a => a.overallRisk === 'HIGH').length;

  const riskDistributionData = [
    { name: 'Low Risk', value: lowRiskCount || 2, color: '#16A34A' },
    { name: 'Medium Risk', value: medRiskCount || 2, color: '#D97706' },
    { name: 'High Risk', value: highRiskCount || 1, color: '#DC2626' },
  ];

  const loanVolumeData = applications.map(app => ({
    name: (app.borrowerName || app.id).split(' ')[0],
    amount: Math.round(app.loanAmount / 100000), // in Lakhs
  }));

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Enterprise Underwriting Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explainable AI copilot for commercial & retail loan risk assessment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/applications"
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Browse All Applications
          </Link>
          <Link
            to="/applications/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Application</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Applications</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalApps}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Active underwriter portfolio
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Under Active Review</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 font-mono tabular-nums">
            {underReviewCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Awaiting risk determination
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Pending Documents</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {pendingDocsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            KYC or bank verification needed
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Approved Applications</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {approvedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Human sign-off completed
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Risk Profile Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown across active evaluated files
            </p>
          </div>
          <div className="h-56 mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} files`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-slate-600">Low ({lowRiskCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Medium ({medRiskCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span className="text-slate-600">High ({highRiskCount})</span>
            </div>
          </div>
        </div>

        {/* Loan Volume Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Requested Principal by Applicant
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Expressed in Lakhs (₹100,000s)
            </p>
          </div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="L" />
                <Tooltip
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Requested Principal']}
                />
                <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Portfolio aggregate exposure: ₹1,88,00,000</span>
            <span>Deterministic Interest Amortization Engine</span>
          </div>
        </div>
      </div>

      {/* Recent Applications Table & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <div className="bg-white border border-slate-200 rounded-lg lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Recent Underwriting Cases
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Priority review queue for loan officers
              </p>
            </div>
            <Link
              to="/applications"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Principal</th>
                  <th className="py-3 px-4">CIBIL</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {app.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {app.borrowerName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        {app.loanPurpose}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 tabular-nums">
                      ₹{app.loanAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      {app.creditScore}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge severity={app.overallRisk} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-600 font-medium">
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Stream */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Underwriting Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time compliance audit events
              </p>
            </div>
            <Link to="/audit-trail" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Audit
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2 flex-1">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-semibold text-slate-800">
                      {act.actorName}
                    </span>
                    <span className="font-mono text-[10px]">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    <span className="font-mono text-blue-600 font-medium text-[11px]">
                      {act.action.replace(/_/g, ' ')}
                    </span>
                    {act.applicationId && (
                      <span className="text-slate-500"> on {act.applicationId}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-xs text-slate-500 text-center">
                No recent activity logged.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
