import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Banknote,
  DollarSign,
  FileUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const NewApplication: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Borrower
    fullName: 'Rohan Deshmukh',
    dateOfBirth: '1991-06-15',
    phone: '+91 98451 90812',
    email: 'rohan.deshmukh@enterprise.in',
    employmentType: 'Salaried - Full Time',
    employer: 'Tata Consultancy Services',
    yearsEmployed: '3.5',

    // Step 2: Loan
    loanAmount: '3500000',
    loanPurpose: 'Residential Property Refurbishment & Expansion',
    loanTenure: '60',
    interestRate: '9.75',

    // Step 3: Financial Information
    annualIncome: '2100000',
    monthlyIncome: '175000',
    monthlyDebt: '35000',
    existingLoans: 'Auto loan balance ₹4.2L',
    assets: '5500000',
    liabilities: '420000',

    // Step 4: Documents
    documents: [
      { documentType: 'Bank Statement', fileName: 'TCS_Salary_Account_HDFC_6M.pdf', snippet: '6 months bank statement showing regular ₹1.75L credit on 29th.' },
      { documentType: 'Salary Slip', fileName: 'TCS_Salary_Slips_Trailing3M.pdf', snippet: 'Gross compensation ₹1.95L, net take-home ₹1.75L after deductions.' },
      { documentType: 'Tax Return', fileName: 'ITR_Acknowledgement_AY2025.pdf', snippet: 'Tax return verified for AY 2025-26 with total income ₹21.0L.' },
      { documentType: 'Identity Document', fileName: 'Govt_PAN_Aadhaar_KYC.pdf', snippet: 'Identity and residential address verified.' }
    ]
  });

  const updateField = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const steps = [
    { number: 1, title: 'Borrower Profile', icon: User },
    { number: 2, title: 'Loan Terms', icon: Banknote },
    { number: 3, title: 'Financials', icon: DollarSign },
    { number: 4, title: 'Documents', icon: FileUp },
    { number: 5, title: 'Review & Intake', icon: CheckCircle2 },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await api.createApplication({
        borrower: {
          name: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          phone: formData.phone,
          email: formData.email,
          employmentType: formData.employmentType,
          employer: formData.employer,
          yearsEmployed: parseFloat(formData.yearsEmployed) || 2.0,
        },
        application: {
          loanAmount: parseFloat(formData.loanAmount) || 1000000,
          loanPurpose: formData.loanPurpose,
          loanTenure: parseInt(formData.loanTenure, 10) || 36,
          interestRate: parseFloat(formData.interestRate) || 10.0,
          creditScore: 735, // Bureau simulated pull
          assignedOfficer: user?.name || 'Arjun Kapoor',
          collateralValue: parseFloat(formData.assets) || 0,
          monthlyIncome: parseFloat(formData.monthlyIncome) || 80000,
          monthlyDebt: parseFloat(formData.monthlyDebt) || 20000,
        },
        documents: formData.documents,
      });

      if (res && res.application) {
        navigate(`/applications/${res.application.id}`);
      } else {
        navigate('/applications');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit loan application.');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New Borrower Underwriting Intake
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Collect borrower details, loan structure, financials, and verification documents
        </p>
      </div>

      {/* Step Tracker */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <React.Fragment key={s.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.number}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-slate-200 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Borrower */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            01. Borrower Identity & Employment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => updateField('employmentType', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option>Salaried - Full Time</option>
                <option>Self-Employed / Business</option>
                <option>Professional / Consultant</option>
                <option>Director / Corporate Executive</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Current Employer / Organization</label>
              <input
                type="text"
                value={formData.employer}
                onChange={(e) => updateField('employer', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Years at Current Employer</label>
              <input
                type="number"
                step="0.5"
                value={formData.yearsEmployed}
                onChange={(e) => updateField('yearsEmployed', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Loan */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            02. Loan Parameters & Purpose
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Requested Loan Principal (₹)</label>
              <input
                type="number"
                step="50000"
                value={formData.loanAmount}
                onChange={(e) => updateField('loanAmount', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Loan Purpose</label>
              <input
                type="text"
                value={formData.loanPurpose}
                onChange={(e) => updateField('loanPurpose', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tenure (in Months)</label>
              <select
                value={formData.loanTenure}
                onChange={(e) => updateField('loanTenure', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              >
                <option value="12">12 Months (1 Year)</option>
                <option value="24">24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
                <option value="48">48 Months (4 Years)</option>
                <option value="60">60 Months (5 Years)</option>
                <option value="72">72 Months (6 Years)</option>
                <option value="84">84 Months (7 Years)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.25"
                value={formData.interestRate}
                onChange={(e) => updateField('interestRate', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Financials */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            03. Borrower Financial Disclosures
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Gross Annual Income (₹)</label>
              <input
                type="number"
                value={formData.annualIncome}
                onChange={(e) => updateField('annualIncome', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Gross Monthly Income (₹)</label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => updateField('monthlyIncome', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Existing Monthly Debt Obligations (₹)</label>
              <input
                type="number"
                value={formData.monthlyDebt}
                onChange={(e) => updateField('monthlyDebt', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Existing Loans Summary</label>
              <input
                type="text"
                value={formData.existingLoans}
                onChange={(e) => updateField('existingLoans', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Collateral / Asset Valuation (₹)</label>
              <input
                type="number"
                value={formData.assets}
                onChange={(e) => updateField('assets', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Total Outstanding Liabilities (₹)</label>
              <input
                type="number"
                value={formData.liabilities}
                onChange={(e) => updateField('liabilities', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Documents */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                04. Verification Documents Vault
              </h2>
              <p className="text-xs text-slate-500">
                Supporting files indexed for deterministic calculations & AI explainability
              </p>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-medium">
              4 Documents Ready
            </span>
          </div>

          <div className="space-y-3">
            {formData.documents.map((doc, idx) => (
              <div key={idx} className="p-3.5 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <FileUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{doc.fileName}</div>
                    <div className="text-[11px] text-slate-500">{doc.documentType} · Indexed</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded font-medium">
                  READY
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center space-y-1">
            <Upload className="w-5 h-5 text-slate-400 mx-auto" />
            <div className="text-xs font-medium text-slate-700">Add Supplementary Verification File</div>
            <div className="text-[11px] text-slate-400">PDF, JPG, PNG up to 10MB supported</div>
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              05. Review & Confirm Application Intake
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic engines will compute EMI, DTI, and policy checks upon creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Borrower Profile
              </h3>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div><span className="text-slate-500">Name:</span> <strong className="text-slate-900">{formData.fullName}</strong></div>
                <div><span className="text-slate-500">Employment:</span> <span className="text-slate-800">{formData.employmentType} at {formData.employer}</span></div>
                <div><span className="text-slate-500">Tenure:</span> <span className="text-slate-800">{formData.yearsEmployed} Years</span></div>
                <div><span className="text-slate-500">Contact:</span> <span className="text-slate-800">{formData.phone} · {formData.email}</span></div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Loan & Financial Disclosures
              </h3>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 font-mono">
                <div><span className="text-slate-500">Requested Principal:</span> <strong className="text-slate-900">₹{Number(formData.loanAmount).toLocaleString('en-IN')}</strong></div>
                <div><span className="text-slate-500">Tenure & Rate:</span> <span className="text-slate-800">{formData.loanTenure} Months @ {formData.interestRate}%</span></div>
                <div><span className="text-slate-500">Monthly Inflow:</span> <span className="text-slate-800">₹{Number(formData.monthlyIncome).toLocaleString('en-IN')}</span></div>
                <div><span className="text-slate-500">Existing Debt:</span> <span className="text-slate-800">₹{Number(formData.monthlyDebt).toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Next Step in Workspace:</span>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                Once created, the underwriting workspace will load with verified figures. You can run AI Underwriting Analysis, review evidence with the "Why?" drawer, and generate an audit-ready Credit Memo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || submitting}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Creating Case...' : 'Submit Loan Case'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
