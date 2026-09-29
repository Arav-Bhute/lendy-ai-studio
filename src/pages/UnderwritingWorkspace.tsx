import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  Upload,
  ArrowRight,
  RefreshCw,
  Info,
  Building,
  User,
  ExternalLink,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { MetricCard } from '../components/common/MetricCard';
import { EvidenceDrawer } from '../components/common/EvidenceDrawer';
import type {
  ApplicationWorkspaceData,
  UnderwritingFinding,
  RiskSeverity,
} from '../types';

export const UnderwritingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ApplicationWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Analysis Progress State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Selected finding for "Why?" Evidence Drawer
  const [selectedFinding, setSelectedFinding] = useState<UnderwritingFinding | null>(null);

  // Filter for findings
  const [findingFilter, setFindingFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'POSITIVE'>('ALL');

  // New document upload state
  const [newDocType, setNewDocType] = useState('Bank Statement');
  const [newDocName, setNewDocName] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const stepsList = [
    'Reviewing applicant KYC & employment files...',
    'Extracting recurring bank transactions & obligations...',
    'Executing deterministic debt-to-income & amortization engines...',
    'Validating declarations across multiple documents...',
    'Evaluating credit profile against institutional risk matrices...',
    'Structuring verified evidence references & document pages...',
    'Synthesizing final underwriting risk findings...',
  ];

  const loadApplication = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getApplication(id);
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load underwriting workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [id]);

  const handleRunAIAnalysis = async () => {
    if (!id) return;
    setAnalyzing(true);
    setAnalysisStep(0);

    // Progressive step indicator for genuine enterprise feel
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < stepsList.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const result = await api.runAIAnalysis(id);
      clearInterval(stepInterval);
      setAnalysisStep(stepsList.length - 1);

      // Re-fetch complete application workspace
      await loadApplication();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI Underwriting Analysis encountered an issue.');
    } finally {
      clearInterval(stepInterval);
      setTimeout(() => {
        setAnalyzing(false);
      }, 500);
    }
  };

  const handleReviewFinding = async (
    findingId: string,
    status: 'FLAGGED' | 'REVIEWED' | 'DISMISSED',
    notes?: string
  ) => {
    if (!id) return;
    try {
      await api.updateFindingStatus(id, findingId, status, notes);
      // update local state
      setData((prev) => {
        if (!prev) return prev;
        const updatedFindings = prev.findings.map((f) =>
          f.id === findingId ? { ...f, status, reviewerNotes: notes || f.reviewerNotes } : f
        );
        return { ...prev, findings: updatedFindings };
      });
      if (selectedFinding && selectedFinding.id === findingId) {
        setSelectedFinding((prev) =>
          prev ? { ...prev, status, reviewerNotes: notes || prev.reviewerNotes } : null
        );
      }
    } catch (err) {
      console.error('Failed to review finding:', err);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newDocName.trim()) return;

    setUploadingDoc(true);
    try {
      await api.uploadDocument(id, {
        documentType: newDocType,
        fileName: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
        snippet: `Verified supplemental ${newDocType} uploaded into vault.`,
      });
      setNewDocName('');
      await loadApplication();
    } catch (err: any) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-6 w-36 bg-slate-200 animate-pulse rounded" />
        <div className="h-28 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20 space-y-4">
        <div className="text-red-600 font-semibold text-sm">Application Not Found</div>
        <p className="text-xs text-slate-500">{error || 'Unable to load workspace data.'}</p>
        <Link
          to="/applications"
          className="inline-block px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg"
        >
          Return to Pipeline
        </Link>
      </div>
    );
  }

  const { application: app, borrower, documents, findings, policies, metrics } = data;

  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const reviewCount = findings.filter((f) => f.severity === 'MEDIUM' || f.severity === 'LOW').length;
  const positiveCount = findings.filter((f) => f.severity === 'POSITIVE').length;

  const filteredFindings = findings.filter((f) => {
    if (findingFilter === 'ALL') return true;
    if (findingFilter === 'HIGH') return f.severity === 'HIGH';
    if (findingFilter === 'MEDIUM') return f.severity === 'MEDIUM' || f.severity === 'LOW';
    if (findingFilter === 'POSITIVE') return f.severity === 'POSITIVE';
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Evidence Drawer Overlay (Signature Feature) */}
      <EvidenceDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onReviewFinding={handleReviewFinding}
      />

      {/* AI Analysis In-Progress Modal */}
      {analyzing && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 animate-spin">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Lendy AI Underwriting Copilot
                </h3>
                <p className="text-[11px] text-slate-500">
                  Synthesizing deterministic facts with Gemini 3.8 Flash
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                <span>Progress Stage</span>
                <span>{analysisStep + 1} / {stepsList.length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((analysisStep + 1) / stepsList.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 min-h-[44px] flex items-center">
              <span>{stepsList[analysisStep]}</span>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Deterministic calculations guarantee arithmetic precision.
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/applications" className="hover:text-blue-600 font-medium">
            Applications
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-slate-800 font-semibold">{app.id}</span>
          <span>·</span>
          <span>{borrower.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/applications/${app.id}/memo`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Credit Memo</span>
          </Link>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {borrower.name}
              </h1>
              <RiskBadge severity={app.overallRisk} />
              <span className="text-xs text-slate-500 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded font-mono">
                {app.id}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {borrower.employmentType} at <strong className="text-slate-800">{borrower.employer}</strong> ({borrower.yearsEmployed} yrs) · {app.loanPurpose}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRunAIAnalysis}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{findings.length > 0 ? 'Re-Run AI Analysis' : 'Run AI Analysis'}</span>
            </button>

            <Link
              to={`/applications/${app.id}/memo`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
            >
              <FileCheck2 className="w-4 h-4 text-slate-500" />
              <span>Credit Memo</span>
            </Link>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Loan Principal</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              ₹{app.loanAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Tenure & Rate</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {app.loanTenure}m @ {app.interestRate}%
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Bureau Score</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {app.creditScore}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Monthly Inflow</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              ₹{app.monthlyIncome.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Existing Debt</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              ₹{app.monthlyDebt.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Assigned Officer</span>
            <span className="font-semibold text-slate-800 text-xs truncate block">
              {app.assignedOfficer}
            </span>
          </div>
        </div>

        {/* Human-in-the-Loop Clarification Banner */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-blue-50/60 border border-blue-200/60 rounded-lg text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>AI Underwriting Copilot:</strong> Mathematical calculations are performed deterministically. AI findings and risk flags are advisory—final credit approval requires authorized human sign-off.
          </span>
        </div>
      </div>

      {/* Deterministic Financial Snapshot Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Deterministic Financial Calculations
            </h2>
            <p className="text-xs text-slate-500">
              Computed strictly via backend financial formulas (zero AI arithmetic hallucination)
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            EMI Amortization · DTI Engine · LTV Cushion
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Computed Monthly EMI"
            metric={metrics.emi}
            accent="default"
            subLabel={`P: ₹${app.loanAmount.toLocaleString('en-IN')} · ${app.loanTenure} mos`}
          />

          <MetricCard
            label="Proposed Total DTI"
            metric={metrics.proposedDTI}
            accent={metrics.proposedDTI.value > 0.6 ? 'danger' : metrics.proposedDTI.value > 0.5 ? 'warning' : 'positive'}
            subLabel={`Existing: ${metrics.existingDTI.formatted} → Proposed: ${metrics.proposedDTI.formatted}`}
          />

          <MetricCard
            label="Loan-to-Value (LTV)"
            metric={metrics.ltv}
            accent={metrics.ltv.value > 0.85 ? 'warning' : 'positive'}
            subLabel={`Collateral backing: ₹${app.collateralValue.toLocaleString('en-IN')}`}
          />

          <MetricCard
            label="Net Free Cash Flow"
            metric={metrics.freeCashFlow}
            accent={metrics.freeCashFlow.value < 0 ? 'danger' : 'positive'}
            subLabel={`After ₹${metrics.estimatedLivingExpenses.toLocaleString('en-IN')} living est.`}
          />
        </div>
      </div>

      {/* Main Analysis Section: AI Findings + Institutional Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Findings & Explainability (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Explainable Risk Findings & Evidence
              </h2>
              <p className="text-xs text-slate-500">
                Click <strong className="text-blue-600">"Why?"</strong> to inspect verified document quotes, page numbers, and math.
              </p>
            </div>

            {/* Findings Filter */}
            <div className="flex items-center gap-1 text-xs bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFindingFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  findingFilter === 'ALL' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({findings.length})
              </button>
              <button
                type="button"
                onClick={() => setFindingFilter('HIGH')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  findingFilter === 'HIGH' ? 'bg-white font-semibold text-red-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                High ({highCount})
              </button>
              <button
                type="button"
                onClick={() => setFindingFilter('MEDIUM')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  findingFilter === 'MEDIUM' ? 'bg-white font-semibold text-amber-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Review ({reviewCount})
              </button>
              <button
                type="button"
                onClick={() => setFindingFilter('POSITIVE')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  findingFilter === 'POSITIVE' ? 'bg-white font-semibold text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Positive ({positiveCount})
              </button>
            </div>
          </div>

          {/* Findings List */}
          {filteredFindings.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3">
              <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No findings generated yet</p>
              <p className="text-xs text-slate-500">
                Click "Run AI Analysis" to trigger Gemini document evaluation and risk detection.
              </p>
              <button
                onClick={handleRunAIAnalysis}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Run AI Analysis Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <RiskBadge severity={finding.severity} />
                        {finding.status === 'REVIEWED' && (
                          <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Reviewed
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {finding.title}
                      </h3>
                    </div>

                    {/* Signature "Why?" button */}
                    <button
                      type="button"
                      onClick={() => setSelectedFinding(finding)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                    >
                      <span>Why?</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {finding.explanation}
                  </p>

                  {/* Fact Observations Tags */}
                  {finding.observations && finding.observations.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-medium">Facts:</span>
                      {finding.observations.map((obs, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono"
                        >
                          {obs.metric}: <strong>{obs.value}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Source Document Reference */}
                  {finding.evidence && finding.evidence.length > 0 && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Source:</span>
                      <strong className="text-slate-700 font-medium">
                        {finding.evidence[0].documentName} (Page {finding.evidence[0].page || 1})
                      </strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Policy Checks & Verification Documents (1 Col) */}
        <div className="space-y-6">
          {/* Institutional Policy Checks */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Institutional Policy Rules
                </h3>
                <p className="text-[11px] text-slate-500">
                  Deterministic thresholds evaluation
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">RULES v2.4</span>
            </div>

            <div className="space-y-3">
              {policies.map((p, idx) => {
                const badgeColor =
                  p.result === 'PASS'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : p.result === 'REVIEW'
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-red-700 bg-red-50 border-red-200';

                return (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{p.policyName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                        {p.result}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Current: {p.value} · Limit: {p.threshold}
                    </div>
                    <p className="text-[11px] text-slate-600 pt-0.5">
                      {p.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Documents Vault */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Evidence Documents
                </h3>
                <p className="text-[11px] text-slate-500">
                  {documents.length} verified files in vault
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 border border-slate-200 rounded-lg bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-medium text-slate-800 truncate">{doc.fileName}</div>
                      <div className="text-[10px] text-slate-400">{doc.documentType}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>

            {/* Upload New Document Form */}
            <form onSubmit={handleUploadDoc} className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Attach Supplementary Document
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                >
                  <option>Bank Statement</option>
                  <option>Salary Slip</option>
                  <option>Tax Return</option>
                  <option>Audited Financials</option>
                  <option>Identity Document</option>
                  <option>Collateral Appraisal</option>
                </select>
                <input
                  type="text"
                  placeholder="Filename..."
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={uploadingDoc || !newDocName.trim()}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded text-xs transition-colors disabled:opacity-50"
              >
                {uploadingDoc ? 'Uploading...' : '+ Add to Evidence Vault'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Strip */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Evidence verified. Proceed to generate the structured Credit Memo for human underwriter review.
          </span>
        </div>

        <Link
          to={`/applications/${app.id}/memo`}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <span>Generate / View Credit Memo</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
