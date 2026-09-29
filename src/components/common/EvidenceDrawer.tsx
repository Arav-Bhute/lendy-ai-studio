import React, { useState } from 'react';
import { X, CheckCircle, FileText, Calculator, ShieldCheck, AlertCircle, BookmarkCheck } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import type { UnderwritingFinding } from '../../types';

interface EvidenceDrawerProps {
  finding: UnderwritingFinding | null;
  onClose: () => void;
  onReviewFinding: (findingId: string, status: 'FLAGGED' | 'REVIEWED' | 'DISMISSED', notes?: string) => Promise<void>;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  finding,
  onClose,
  onReviewFinding,
}) => {
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!finding) return null;

  const handleMarkReviewed = async () => {
    setSubmitting(true);
    try {
      await onReviewFinding(finding.id, 'REVIEWED', reviewNote || finding.reviewerNotes || 'Underwriter confirmed supporting evidence.');
      setSuccessMsg('Finding marked as reviewed');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNoteOnly = async () => {
    if (!reviewNote.trim()) return;
    setSubmitting(true);
    try {
      await onReviewFinding(finding.id, finding.status, reviewNote);
      setSuccessMsg('Review note saved');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900 leading-tight">
                Explainability & Evidence Dossier
              </h2>
              <p className="text-xs text-slate-500">
                Lendy Underwriting Audit Trail & Fact Link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* Finding Title & Severity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Flagged Observation
              </span>
              <RiskBadge severity={finding.severity} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {finding.title}
            </h3>
            {finding.status === 'REVIEWED' && (
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Marked as Reviewed by Human Underwriter</span>
              </div>
            )}
          </div>

          {/* What Lendy Observed */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>01. What Lendy Observed</span>
            </h4>
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2">
              {finding.observations && finding.observations.length > 0 ? (
                finding.observations.map((obs, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                    <span className="text-slate-600 font-medium">{obs.metric}</span>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {obs.value}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {obs.source} {obs.page ? `· Page ${obs.page}` : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600">Standard application parameters evaluated.</p>
              )}
            </div>
          </div>

          {/* AI Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              02. AI Reasoning & Impact
            </h4>
            <div className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-lg text-xs leading-relaxed text-slate-700">
              {finding.explanation}
            </div>
          </div>

          {/* Supporting Evidence Layer */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>03. Verified Supporting Evidence</span>
            </h4>
            {finding.evidence && finding.evidence.length > 0 ? (
              <div className="space-y-2">
                {finding.evidence.map((ev, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-800 mb-1">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold">{ev.documentName}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Page {ev.page || 1}
                      </span>
                    </div>
                    <blockquote className="text-xs text-slate-600 italic border-l-2 border-blue-400 pl-2 mt-1">
                      "{ev.quoteOrMetric}"
                    </blockquote>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Evidence unavailable in current document vault — human loan officer verification required.</span>
              </div>
            )}
          </div>

          {/* Recommendation for Underwriter */}
          {finding.recommendedReview && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                04. Recommended Underwriter Action
              </h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                {finding.recommendedReview}
              </div>
            </div>
          )}

          {/* Human Review Notes & Sign-off area */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              05. Loan Officer & Underwriter Notes
            </h4>
            {finding.reviewerNotes && (
              <div className="p-2.5 bg-slate-100 rounded text-xs text-slate-700 border border-slate-200">
                <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">Previous Note:</span>
                {finding.reviewerNotes}
              </div>
            )}
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Enter audit notes or explanation for your review decision..."
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            />
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleAddNoteOnly}
            disabled={submitting || !reviewNote.trim()}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            Add Review Note
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleMarkReviewed}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Reviewed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
