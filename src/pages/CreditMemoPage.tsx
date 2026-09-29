import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Edit3,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Copy,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { useAuth } from '../context/AuthContext';
import type { ApplicationWorkspaceData, CreditMemo, DecisionType } from '../types';

export const CreditMemoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<ApplicationWorkspaceData | null>(null);
  const [memo, setMemo] = useState<CreditMemo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Editable memo fields
  const [editableExecutiveSummary, setEditableExecutiveSummary] = useState('');
  const [editableFinancialAnalysis, setEditableFinancialAnalysis] = useState('');
  const [editableRepaymentCapacity, setEditableRepaymentCapacity] = useState('');

  // Human Sign-off Station
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionResultMsg, setDecisionResultMsg] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [ws, existingMemo] = await Promise.all([
        api.getApplication(id),
        api.getMemo(id),
      ]);
      setWorkspace(ws);

      if (existingMemo) {
        setMemo(existingMemo);
        setEditableExecutiveSummary(existingMemo.content.executiveSummary);
        setEditableFinancialAnalysis(existingMemo.content.financialAnalysis);
        setEditableRepaymentCapacity(existingMemo.content.repaymentCapacity);
        if (existingMemo.decisionNotes) {
          setDecisionNotes(existingMemo.decisionNotes);
        }
      }
    } catch (err) {
      console.error('Failed to load credit memo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleGenerateMemo = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      const generated = await api.generateMemo(id);
      setMemo(generated);
      setEditableExecutiveSummary(generated.content.executiveSummary);
      setEditableFinancialAnalysis(generated.content.financialAnalysis);
      setEditableRepaymentCapacity(generated.content.repaymentCapacity);
      setIsEditing(false);
      // reload workspace to update audit logs
      const ws = await api.getApplication(id);
      setWorkspace(ws);
    } catch (err: any) {
      alert('Failed to generate credit memo: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!id || !memo) return;
    try {
      const updatedContent = {
        ...memo.content,
        executiveSummary: editableExecutiveSummary,
        financialAnalysis: editableFinancialAnalysis,
        repaymentCapacity: editableRepaymentCapacity,
      };
      const res = await api.updateMemo(id, updatedContent);
      setMemo(res);
      setIsEditing(false);
    } catch (err: any) {
      alert('Failed to save memo edit: ' + err.message);
    }
  };

  const handleRecordDecision = async (decision: DecisionType) => {
    if (!id) return;
    setSubmittingDecision(true);
    setDecisionResultMsg('');

    try {
      const reviewerTitle = user?.role === 'admin' ? 'Risk Admin' : 'Lead Underwriter';
      const reviewerDisplayName = user ? `${user.name} (${reviewerTitle})` : 'Arjun Kapoor (Lead Underwriter)';

      const res = await api.submitReview(id, {
        decision,
        notes: decisionNotes || `Underwriting review decision: ${decision}`,
        reviewerName: reviewerDisplayName,
      });

      setDecisionResultMsg(`Human Decision successfully recorded: ${decision}`);
      await loadData();
    } catch (err: any) {
      alert('Failed to record review decision: ' + err.message);
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleCopyText = () => {
    if (!memo) return;
    const text = `
CREDIT MEMO — ${workspace?.borrower.name} (${workspace?.application.id})
Status: ${workspace?.application.status} | Overall Risk: ${workspace?.application.overallRisk}

1. EXECUTIVE SUMMARY
${memo.content.executiveSummary}

2. BORROWER PROFILE
${memo.content.borrowerProfile}

3. LOAN REQUEST
${memo.content.loanRequest}

4. FINANCIAL ANALYSIS
${memo.content.financialAnalysis}

5. REPAYMENT CAPACITY
${memo.content.repaymentCapacity}

6. RISK FACTORS
${memo.content.riskFactors.map(r => `• ${r}`).join('\n')}

7. POSITIVE FACTORS
${memo.content.positiveFactors.map(p => `• ${p}`).join('\n')}

8. POLICY CHECKS
${memo.content.policyChecksSummary}

HUMAN REVIEW & DECISION:
Decision: ${memo.decision || 'PENDING'}
Reviewer Notes: ${memo.decisionNotes || 'None'}
Reviewed By: ${memo.reviewedBy || 'Pending sign-off'}
`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="h-96 bg-slate-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20">
        <p className="text-sm font-semibold text-slate-800">Application not found</p>
      </div>
    );
  }

  const { application: app, borrower } = workspace;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/applications" className="hover:text-blue-600 font-medium">
            Applications
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/applications/${app.id}`} className="font-mono text-slate-800 font-semibold hover:text-blue-600">
            {app.id}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Credit Memo</span>
        </div>

        <Link
          to={`/applications/${app.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Underwriting Workspace
        </Link>
      </div>

      {/* Credit Memo Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Institutional Credit Memo
              </h1>
              <RiskBadge severity={app.overallRisk} />
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                {app.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Case Ref: <strong className="font-mono text-slate-800">{app.id}</strong> · {borrower.name} · Loan Facility: ₹{app.loanAmount.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {!memo ? (
              <button
                type="button"
                onClick={handleGenerateMemo}
                disabled={generating}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Drafting Memo...' : 'Generate Credit Memo'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGenerateMemo}
                  disabled={generating}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Edits</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Memo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mandatory Copilot Human Sign-off Notice */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Compliance Standard Notice:</strong>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              This credit memo is an AI-assisted draft prepared for underwriting review. Final lending sanction, covenant structuring, or rejection decisions remain strictly with an authorized human loan officer.
            </p>
          </div>
        </div>
      </div>

      {/* Credit Memo Document Viewer */}
      {!memo ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Credit Memo Not Generated Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Synthesize application records, deterministic debt-service ratios, verified documents, and policy evaluations into a structured credit memorandum.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateMemo}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Drafting Memo...' : 'Generate Credit Memo with Lendy'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs space-y-8 text-slate-800">
          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              01. Executive Summary
            </h2>
            {isEditing ? (
              <textarea
                rows={4}
                value={editableExecutiveSummary}
                onChange={(e) => setEditableExecutiveSummary(e.target.value)}
                className="w-full text-xs p-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-sans"
              />
            ) : (
              <p className="text-xs leading-relaxed text-slate-700 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                {memo.content.executiveSummary}
              </p>
            )}
          </div>

          {/* Section 2: Borrower Profile */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              02. Borrower Profile & Background
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
              {memo.content.borrowerProfile}
            </p>
          </div>

          {/* Section 3: Loan Request */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              03. Loan Request & Terms
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
              {memo.content.loanRequest}
            </p>
          </div>

          {/* Section 4: Financial Analysis */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              04. Financial & Debt Analysis
            </h2>
            {isEditing ? (
              <textarea
                rows={4}
                value={editableFinancialAnalysis}
                onChange={(e) => setEditableFinancialAnalysis(e.target.value)}
                className="w-full text-xs p-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-sans"
              />
            ) : (
              <p className="text-xs leading-relaxed text-slate-700 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                {memo.content.financialAnalysis}
              </p>
            )}
          </div>

          {/* Section 5: Repayment Capacity */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              05. Repayment Capacity & Cash Flow
            </h2>
            {isEditing ? (
              <textarea
                rows={3}
                value={editableRepaymentCapacity}
                onChange={(e) => setEditableRepaymentCapacity(e.target.value)}
                className="w-full text-xs p-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-sans"
              />
            ) : (
              <p className="text-xs leading-relaxed text-slate-700 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                {memo.content.repaymentCapacity}
              </p>
            )}
          </div>

          {/* Section 6 & 7: Risk Factors & Positive Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h2 className="text-xs font-mono uppercase tracking-wider text-red-600 font-bold">
                06. Key Underwriting Risk Factors
              </h2>
              <ul className="space-y-1.5 bg-red-50/30 p-4 rounded-lg border border-red-100 text-xs">
                {memo.content.riskFactors && memo.content.riskFactors.length > 0 ? (
                  memo.content.riskFactors.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No elevated risk factors detected.</li>
                )}
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
                07. Compensating Positive Factors
              </h2>
              <ul className="space-y-1.5 bg-emerald-50/30 p-4 rounded-lg border border-emerald-100 text-xs">
                {memo.content.positiveFactors && memo.content.positiveFactors.length > 0 ? (
                  memo.content.positiveFactors.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Standard verified profile.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Section 8: Policy Checks Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              08. Institutional Policy Rule Evaluation
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
              {memo.content.policyChecksSummary}
            </p>
          </div>

          {/* Section 9 & 10: Missing Info & Officer Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h2 className="text-xs font-mono uppercase tracking-wider text-amber-700 font-bold">
                09. Pending Information & Follow-Ups
              </h2>
              <ul className="space-y-1.5 bg-amber-50/30 p-4 rounded-lg border border-amber-100 text-xs">
                {memo.content.missingInformation && memo.content.missingInformation.length > 0 ? (
                  memo.content.missingInformation.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">All required documents verified on file.</li>
                )}
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold">
                10. Questions for Borrower Interview
              </h2>
              <ul className="space-y-1.5 bg-blue-50/30 p-4 rounded-lg border border-blue-100 text-xs">
                {memo.content.questionsForLoanOfficer && memo.content.questionsForLoanOfficer.length > 0 ? (
                  memo.content.questionsForLoanOfficer.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No special interview inquiries requested.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Section 11: Verified Supporting Evidence */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              11. Verified Supporting Evidence Layer
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {memo.content.supportingEvidence && memo.content.supportingEvidence.map((ev, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="truncate">{ev.document}</span>
                    <span className="font-mono text-[10px] bg-white border border-slate-200 px-1 py-0.5 rounded">
                      Page {ev.page || 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{ev.fact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Human Underwriter Sign-Off Station (The final mandate of Lendy) */}
      <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Human Underwriter Final Review Station
              </h2>
              <p className="text-xs text-slate-500">
                Autonomous AI lending approval is prohibited. Record your formal authorized decision.
              </p>
            </div>
          </div>

          {memo?.decision && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Recorded Decision</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                memo.decision === 'APPROVE' ? 'bg-emerald-100 text-emerald-800' :
                memo.decision === 'REJECT' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {memo.decision} by {memo.reviewedBy || 'Officer'}
              </span>
            </div>
          )}
        </div>

        {decisionResultMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{decisionResultMsg}</span>
          </div>
        )}

        {user?.role === 'loan_officer' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Role Access:</strong> As a Loan Officer, this human sign-off station is read-only. Formal approval and rejection decisions require sign-off by a Lead Underwriter or Risk Admin.
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Authorized Underwriter Assessment Notes & Conditions
          </label>
          <textarea
            rows={3}
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            disabled={user?.role === 'loan_officer'}
            placeholder="Record justification, mitigation terms, pre-disbursement covenants, or required documentation..."
            className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500">
            Sign-off will be permanently logged to the Compliance Audit Trail.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleRecordDecision('REQUEST_INFO')}
              disabled={submittingDecision || user?.role === 'loan_officer'}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Request More Info</span>
            </button>

            <button
              type="button"
              onClick={() => handleRecordDecision('REJECT')}
              disabled={submittingDecision || user?.role === 'loan_officer'}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Facility</span>
            </button>

            <button
              type="button"
              onClick={() => handleRecordDecision('APPROVE')}
              disabled={submittingDecision || user?.role === 'loan_officer'}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Loan Facility</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
