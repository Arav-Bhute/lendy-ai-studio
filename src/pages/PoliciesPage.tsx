import React from 'react';
import { ShieldCheck, Sliders, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const policies = [
    {
      name: 'Credit Score Floor',
      threshold: '≥ 600 Minimum (≥ 650 Preferred)',
      category: 'Credit Bureau Profile',
      logic: 'Borrowers with CIBIL score < 600 trigger High Risk automatic denial recommendation. Scores between 600 and 649 require secondary underwriter exception review and guarantor confirmation.',
      severity: 'Strict Policy',
      status: 'Active',
    },
    {
      name: 'Maximum Proposed Debt-to-Income (DTI)',
      threshold: '≤ 50% Standard (≤ 60% Hard Ceiling)',
      category: 'Cash Flow Capacity',
      logic: 'Proposed DTI = (Existing Monthly Obligations + New Loan Monthly EMI) / Gross Monthly Income. If DTI > 60%, flagged as High Risk due to severe debt service overhang. Between 50% and 60% requires discretionary cash flow analysis.',
      severity: 'Hard Ceiling',
      status: 'Active',
    },
    {
      name: 'Collateral Loan-to-Value (LTV) Exposure',
      threshold: '≤ 80% Prime (≤ 85% with Mortgage Insurance)',
      category: 'Collateral & Asset Cushion',
      logic: 'LTV = Requested Principal / Appraised Asset Valuation. Ratios above 80% require secondary collateral charge, hypothecation registration, or mortgage insurance guarantee.',
      severity: 'Standard Rule',
      status: 'Active',
    },
    {
      name: 'Mandatory Compliance Documents',
      threshold: 'Bank Statement, Salary/Income Slip, Identity Document',
      category: 'Regulatory Verification',
      logic: 'All commercial and retail loan files must include verified trailing 6-month bank statements, recent payroll/ITR proof, and government photo KYC. Absence places file in Pending Documents status.',
      severity: 'Regulatory Mandate',
      status: 'Active',
    },
    {
      name: 'Employment Tenure Stability',
      threshold: '≥ 1.0 Year at Current Employer',
      category: 'Borrower Track Record',
      logic: 'Borrowers with less than 12 months at their current employer require verification of continuous work tenure in the preceding 36 months to verify career continuity.',
      severity: 'Underwriting Guideline',
      status: 'Active',
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Policy Engine Rules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configurable demonstration credit policies evaluated deterministically across all loan applications
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded font-semibold">
          POLICY ENGINE ACTIVE
        </span>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Demonstration Policy Notice:</strong>
          <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
            These rules reflect standard institutional commercial bank demonstration parameters. Backend deterministic code evaluates these rules without AI calculation interference. The AI Copilot explains policy impacts but cannot autonomously override policy results.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {policies.map((p, idx) => (
          <div key={idx} className="p-5 space-y-2 hover:bg-slate-50/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {p.category}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded self-start sm:self-auto">
                {p.threshold}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              {p.logic}
            </p>

            <div className="pl-6 flex items-center gap-4 text-[11px] text-slate-400">
              <span>Classification: <strong className="text-slate-600">{p.severity}</strong></span>
              <span>·</span>
              <span>Status: <strong className="text-emerald-600">{p.status}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
