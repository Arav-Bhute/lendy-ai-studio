import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, ArrowRight, Filter, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import type { LoanApplication } from '../types';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNDER_REVIEW' | 'PENDING_DOCUMENTS' | 'COMPLETED' | 'HIGH_RISK'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apps = await api.getApplications();
        setApplications(apps);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        (app.borrowerName || '').toLowerCase().includes(search.toLowerCase()) ||
        app.id.toLowerCase().includes(search.toLowerCase()) ||
        app.loanPurpose.toLowerCase().includes(search.toLowerCase()) ||
        (app.employmentType || '').toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'UNDER_REVIEW') return app.status === 'UNDER_REVIEW' || app.status === 'NEEDS_REVIEW';
      if (statusFilter === 'PENDING_DOCUMENTS') return app.status === 'PENDING_DOCUMENTS';
      if (statusFilter === 'COMPLETED') return app.status === 'APPROVED' || app.status === 'REJECTED';
      if (statusFilter === 'HIGH_RISK') return app.overallRisk === 'HIGH';

      return true;
    });
  }, [applications, search, statusFilter]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Loan Applications Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete active portfolio for underwriting, verification, and credit evaluation
          </p>
        </div>

        <Link
          to="/applications/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Application</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-lg border border-slate-200">
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Files ({applications.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('UNDER_REVIEW')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Under Review
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING_DOCUMENTS')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'PENDING_DOCUMENTS'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Docs
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('HIGH_RISK')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'HIGH_RISK'
                ? 'bg-white text-red-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            High Risk
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'COMPLETED'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search borrower, ID, employer..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Borrower Details</th>
                <th className="py-3.5 px-4">Requested Principal</th>
                <th className="py-3.5 px-4">Tenure & Rate</th>
                <th className="py-3.5 px-4">Credit Score</th>
                <th className="py-3.5 px-4">Risk Profile</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Officer</th>
                <th className="py-3.5 px-4 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    Loading loan applications...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <p className="font-medium text-slate-700">No applications match your filter.</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your search criteria or filter tabs.</p>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {app.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {app.borrowerName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {app.loanPurpose}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                      ₹{app.loanAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">
                      {app.loanTenure} mos @ {app.interestRate}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 tabular-nums">
                      {app.creditScore}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge severity={app.overallRisk} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-slate-700">
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.assignedOfficer}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 rounded transition-colors"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
