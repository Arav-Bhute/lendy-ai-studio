import { calculateEMI, calculateDTI, calculateLTV, calculateFreeCashFlow, calculateDSCR } from '../calculations/financialEngine.js';
import { evaluatePolicies } from '../policies/policyEngine.js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'loan_officer' | 'underwriter' | 'admin';
}

export interface Borrower {
  id: string;
  name: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  employmentType: string;
  employer: string;
  yearsEmployed: number;
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  borrowerId: string;
  loanAmount: number;
  loanPurpose: string;
  loanTenure: number; // months
  interestRate: number; // %
  creditScore: number;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'PENDING';
  status: 'UNDER_REVIEW' | 'NEEDS_REVIEW' | 'PENDING_DOCUMENTS' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
  assignedOfficer: string;
  collateralValue: number;
  monthlyIncome: number;
  monthlyDebt: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  applicationId: string;
  documentType: string;
  fileName: string;
  storagePath: string;
  fileSizeBytes: number;
  processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  createdAt: string;
  extractedSnippet?: string;
}

export interface ExtractedFact {
  id: string;
  applicationId: string;
  documentId?: string;
  documentName: string;
  fieldName: string;
  fieldValue: string;
  sourcePage: number;
  confidence: number;
}

export interface UnderwritingFinding {
  id: string;
  applicationId: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'POSITIVE';
  title: string;
  explanation: string;
  observations: Array<{
    metric: string;
    value: string;
    source: string;
    page: number;
  }>;
  evidence: Array<{
    documentName: string;
    page: number;
    quoteOrMetric: string;
  }>;
  recommendedReview?: string;
  status: 'FLAGGED' | 'REVIEWED' | 'DISMISSED';
  reviewerNotes?: string;
  createdAt: string;
}

export interface CreditMemoContent {
  executiveSummary: string;
  borrowerProfile: string;
  loanRequest: string;
  financialAnalysis: string;
  repaymentCapacity: string;
  riskFactors: string[];
  positiveFactors: string[];
  policyChecksSummary: string;
  missingInformation: string[];
  questionsForLoanOfficer: string[];
  supportingEvidence: Array<{
    document: string;
    page: number;
    fact: string;
  }>;
}

export interface CreditMemo {
  id: string;
  applicationId: string;
  content: CreditMemoContent;
  version: number;
  generatedBy: string;
  decision?: 'APPROVE' | 'REJECT' | 'REQUEST_INFO';
  decisionNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  applicationId?: string;
  actorId: string;
  actorName: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
}

class InMemoryStore {
  users: Map<string, User> = new Map();
  borrowers: Map<string, Borrower> = new Map();
  applications: Map<string, LoanApplication> = new Map();
  documents: Map<string, DocumentRecord> = new Map();
  extractedData: Map<string, ExtractedFact[]> = new Map(); // keyed by applicationId
  findings: Map<string, UnderwritingFinding[]> = new Map(); // keyed by applicationId
  memos: Map<string, CreditMemo> = new Map(); // keyed by applicationId
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // Users
    const u1: User = { id: 'usr-1', name: 'Arjun Kapoor', email: 'arjun.kapoor@lendy.finance', role: 'underwriter' };
    const u2: User = { id: 'usr-2', name: 'Sunita Rao', email: 'sunita.rao@lendy.finance', role: 'loan_officer' };
    const u3: User = { id: 'usr-3', name: 'Devon Patel', email: 'devon.patel@lendy.finance', role: 'admin' };
    [u1, u2, u3].forEach(u => this.users.set(u.id, u));

    // Borrowers
    const b1: Borrower = {
      id: 'bor-1',
      name: 'Rahul Sharma',
      dateOfBirth: '1989-04-12',
      phone: '+91 98201 44521',
      email: 'rahul.sharma@techcorp.in',
      employmentType: 'Salaried - Full Time',
      employer: 'Infosys Technologies Ltd',
      yearsEmployed: 4.5,
      createdAt: '2026-09-01T10:00:00.000Z'
    };
    const b2: Borrower = {
      id: 'bor-2',
      name: 'Aman Verma',
      dateOfBirth: '1992-11-23',
      phone: '+91 98112 77341',
      email: 'aman.verma@craftworks.co',
      employmentType: 'Self-Employed / Business',
      employer: 'Craftworks Digital Studio',
      yearsEmployed: 1.2,
      createdAt: '2026-09-05T14:30:00.000Z'
    };
    const b3: Borrower = {
      id: 'bor-3',
      name: 'Priya Mehta',
      dateOfBirth: '1995-07-08',
      phone: '+91 97334 11982',
      email: 'priya.mehta@fintechlabs.io',
      employmentType: 'Salaried - Full Time',
      employer: 'HDFC ERGO General Insurance',
      yearsEmployed: 3.0,
      createdAt: '2026-09-12T09:15:00.000Z'
    };
    const b4: Borrower = {
      id: 'bor-4',
      name: 'Vikram Malhotra',
      dateOfBirth: '1984-02-19',
      phone: '+91 98450 33219',
      email: 'vikram.m@zenithlogistics.in',
      employmentType: 'Director / Business',
      employer: 'Zenith Freight Logistics LLP',
      yearsEmployed: 8.0,
      createdAt: '2026-09-15T11:00:00.000Z'
    };
    const b5: Borrower = {
      id: 'bor-5',
      name: 'Ananya Sen',
      dateOfBirth: '1993-09-30',
      phone: '+91 98701 55662',
      email: 'ananya.sen@healthplus.org',
      employmentType: 'Professional / Doctor',
      employer: 'Apollo Multi-Specialty Hospital',
      yearsEmployed: 5.0,
      createdAt: '2026-09-18T16:20:00.000Z'
    };
    [b1, b2, b3, b4, b5].forEach(b => this.borrowers.set(b.id, b));

    // Applications
    const app1: LoanApplication = {
      id: 'APP-8291',
      borrowerId: 'bor-1',
      loanAmount: 2500000,
      loanPurpose: 'Home Improvement & Solar Energy Installation',
      loanTenure: 60,
      interestRate: 9.50,
      creditScore: 742,
      overallRisk: 'LOW',
      status: 'UNDER_REVIEW',
      assignedOfficer: 'Arjun Kapoor',
      collateralValue: 3800000,
      monthlyIncome: 145000,
      monthlyDebt: 28000,
      createdAt: '2026-09-20T08:30:00.000Z',
      updatedAt: '2026-09-28T14:20:00.000Z'
    };

    const app2: LoanApplication = {
      id: 'APP-9042',
      borrowerId: 'bor-2',
      loanAmount: 4000000,
      loanPurpose: 'Commercial Studio Expansion & High-End Camera Rigging',
      loanTenure: 48,
      interestRate: 12.25,
      creditScore: 621,
      overallRisk: 'HIGH',
      status: 'NEEDS_REVIEW',
      assignedOfficer: 'Arjun Kapoor',
      collateralValue: 2500000,
      monthlyIncome: 82000,
      monthlyDebt: 55000,
      createdAt: '2026-09-22T11:45:00.000Z',
      updatedAt: '2026-09-27T09:10:00.000Z'
    };

    const app3: LoanApplication = {
      id: 'APP-7619',
      borrowerId: 'bor-3',
      loanAmount: 1800000,
      loanPurpose: 'Higher Education Executive Masters Program',
      loanTenure: 36,
      interestRate: 10.50,
      creditScore: 718,
      overallRisk: 'MEDIUM',
      status: 'PENDING_DOCUMENTS',
      assignedOfficer: 'Sunita Rao',
      collateralValue: 2200000,
      monthlyIncome: 110000,
      monthlyDebt: 32000,
      createdAt: '2026-09-24T15:00:00.000Z',
      updatedAt: '2026-09-26T17:40:00.000Z'
    };

    const app4: LoanApplication = {
      id: 'APP-6550',
      borrowerId: 'bor-4',
      loanAmount: 7500000,
      loanPurpose: 'Fleet Machinery & Heavy Crane Replacement',
      loanTenure: 72,
      interestRate: 8.75,
      creditScore: 785,
      overallRisk: 'LOW',
      status: 'APPROVED',
      assignedOfficer: 'Arjun Kapoor',
      collateralValue: 12000000,
      monthlyIncome: 350000,
      monthlyDebt: 85000,
      createdAt: '2026-09-16T09:20:00.000Z',
      updatedAt: '2026-09-25T13:00:00.000Z'
    };

    const app5: LoanApplication = {
      id: 'APP-5412',
      borrowerId: 'bor-5',
      loanAmount: 3000000,
      loanPurpose: 'Diagnostic Ultrasound Equipment Upgrade',
      loanTenure: 60,
      interestRate: 9.25,
      creditScore: 690,
      overallRisk: 'MEDIUM',
      status: 'UNDER_REVIEW',
      assignedOfficer: 'Sunita Rao',
      collateralValue: 4500000,
      monthlyIncome: 190000,
      monthlyDebt: 68000,
      createdAt: '2026-09-19T10:15:00.000Z',
      updatedAt: '2026-09-28T11:05:00.000Z'
    };

    [app1, app2, app3, app4, app5].forEach(app => this.applications.set(app.id, app));

    // Documents
    const docsApp1: DocumentRecord[] = [
      {
        id: 'doc-1',
        applicationId: 'APP-8291',
        documentType: 'Bank Statement',
        fileName: 'HDFC_Salary_Account_6M_RahulSharma.pdf',
        storagePath: 'vault/APP-8291/hdfc_6m.pdf',
        fileSizeBytes: 2420000,
        processingStatus: 'PROCESSED',
        createdAt: '2026-09-20T08:35:00.000Z',
        extractedSnippet: 'Regular monthly salary credit ₹1,45,000 on 30th of each month. Average monthly balance ₹2,80,000.'
      },
      {
        id: 'doc-2',
        applicationId: 'APP-8291',
        documentType: 'Salary Slip',
        fileName: 'Infosys_Salary_Slips_Q3_Rahul.pdf',
        storagePath: 'vault/APP-8291/salary_q3.pdf',
        fileSizeBytes: 980000,
        processingStatus: 'PROCESSED',
        createdAt: '2026-09-20T08:36:00.000Z',
        extractedSnippet: 'Gross monthly pay ₹1,65,000; Net take-home ₹1,45,000 after PF & TDS deductions.'
      },
      {
        id: 'doc-3',
        applicationId: 'APP-8291',
        documentType: 'Tax Return',
        fileName: 'ITR_V_AY2025_26_RahulSharma.pdf',
        storagePath: 'vault/APP-8291/itr_v.pdf',
        fileSizeBytes: 1250000,
        processingStatus: 'PROCESSED',
        createdAt: '2026-09-20T08:37:00.000Z',
        extractedSnippet: 'Gross Total Income acknowledged: ₹19,80,000 for assessment year 2025-26.'
      },
      {
        id: 'doc-4',
        applicationId: 'APP-8291',
        documentType: 'Identity Document',
        fileName: 'Govt_ID_KYC_Verification_Rahul.pdf',
        storagePath: 'vault/APP-8291/kyc.pdf',
        fileSizeBytes: 450000,
        processingStatus: 'PROCESSED',
        createdAt: '2026-09-20T08:38:00.000Z',
        extractedSnippet: 'PAN and Aadhaar identity verified. Residential address matches application.'
      }
    ];

    const docsApp2: DocumentRecord[] = [
      {
        id: 'doc-5',
        applicationId: 'APP-9042',
        documentType: 'Bank Statement',
        fileName: 'ICICI_Current_Account_AmanVerma.pdf',
        storagePath: 'vault/APP-9042/icici_statement.pdf',
        fileSizeBytes: 3100000,
        processingStatus: 'PROCESSED',
        createdAt: '2026-09-22T11:50:00.000Z',
        extractedSnippet: 'Volatile month-end balances. Unexplained lump sum deposit of ₹8,50,000 noted on page 4.'
      },
      {
        id: 'doc-6',
        applicationId: 'APP-9042',
        documentType: 'Credit Report',
        fileName: 'CIBIL_Detailed_Report_Aman.pdf',
        storagePath: 'vault/APP-9042/cibil_report.pdf',
        fileSizeBytes: 890000,
        processingStatus: 'PROCESSED',
        createdAt: '2026-09-22T11:52:00.000Z',
        extractedSnippet: 'Credit score 621. Two 30-day past-due marks on revolving retail credit cards over trailing 12 months.'
      }
    ];

    [...docsApp1, ...docsApp2].forEach(d => this.documents.set(d.id, d));

    // Extracted Facts for APP-8291 (Rahul Sharma)
    this.extractedData.set('APP-8291', [
      {
        id: 'f-1',
        applicationId: 'APP-8291',
        documentName: 'HDFC_Salary_Account_6M_RahulSharma.pdf',
        fieldName: 'Verified Monthly Inflow',
        fieldValue: '₹1,45,000 / month',
        sourcePage: 2,
        confidence: 0.98
      },
      {
        id: 'f-2',
        applicationId: 'APP-8291',
        documentName: 'HDFC_Salary_Account_6M_RahulSharma.pdf',
        fieldName: 'Existing EMI Debits',
        fieldValue: '₹28,000 / month (Auto Loan)',
        sourcePage: 3,
        confidence: 0.96
      },
      {
        id: 'f-3',
        applicationId: 'APP-8291',
        documentName: 'Infosys_Salary_Slips_Q3_Rahul.pdf',
        fieldName: 'Employer Stability',
        fieldValue: 'Senior Architect - 4.5 Years Tenured',
        sourcePage: 1,
        confidence: 0.99
      },
      {
        id: 'f-4',
        applicationId: 'APP-8291',
        documentName: 'ITR_V_AY2025_26_RahulSharma.pdf',
        fieldName: 'Annual Gross Income',
        fieldValue: '₹19,80,000',
        sourcePage: 1,
        confidence: 0.99
      }
    ]);

    // Initial Underwriting Findings for APP-8291 (Rahul Sharma)
    this.findings.set('APP-8291', [
      {
        id: 'find-101',
        applicationId: 'APP-8291',
        severity: 'POSITIVE',
        title: 'Strong Primary Income Stability & Bureau Profile',
        explanation: 'Borrower demonstrates 4.5 years of continuous employment at Infosys with steady ₹1,45,000 monthly take-home salary and an excellent credit bureau score of 742.',
        observations: [
          { metric: 'Credit Score', value: '742', source: 'CIBIL Bureau Pull', page: 1 },
          { metric: 'Employer Tenure', value: '4.5 Years', source: 'Infosys_Salary_Slips_Q3_Rahul.pdf', page: 1 },
          { metric: 'Monthly Income', value: '₹1,45,000', source: 'HDFC_Salary_Account_6M_RahulSharma.pdf', page: 2 }
        ],
        evidence: [
          { documentName: 'Infosys_Salary_Slips_Q3_Rahul.pdf', page: 1, quoteOrMetric: 'Tenure verified: 4 years, 6 months in engineering division.' },
          { documentName: 'HDFC_Salary_Account_6M_RahulSharma.pdf', page: 2, quoteOrMetric: 'Consistent payroll credits from Infosys Ltd on 30th of each month.' }
        ],
        recommendedReview: 'Routine income re-verification during final sign-off.',
        status: 'FLAGGED',
        createdAt: '2026-09-28T14:22:00.000Z'
      },
      {
        id: 'find-102',
        applicationId: 'APP-8291',
        severity: 'LOW',
        title: 'Comfortable Debt Service & Post-Loan Cash Buffer',
        explanation: 'Proposed loan of ₹25,00,000 creates an EMI of ₹52,492. Combined debt servicing reaches ₹80,492, resulting in a proposed DTI of 55.5%. After standard living expenditures, borrower retains ₹34,508 in free monthly cash flow.',
        observations: [
          { metric: 'New Loan EMI', value: '₹52,492', source: 'Financial Engine (Deterministic)', page: 1 },
          { metric: 'Proposed DTI', value: '55.5%', source: 'Financial Engine (Deterministic)', page: 1 },
          { metric: 'Net Free Cash Flow', value: '₹34,508', source: 'Financial Engine (Deterministic)', page: 1 }
        ],
        evidence: [
          { documentName: 'HDFC_Salary_Account_6M_RahulSharma.pdf', page: 3, quoteOrMetric: 'Existing auto loan debit ₹28,000 scheduled through Dec 2027.' },
          { documentName: 'ITR_V_AY2025_26_RahulSharma.pdf', page: 1, quoteOrMetric: 'Taxable salary ₹19.8L with no conflicting commercial commitments.' }
        ],
        recommendedReview: 'Confirm if auto loan has pre-payment options to further lower monthly obligations.',
        status: 'FLAGGED',
        createdAt: '2026-09-28T14:22:00.000Z'
      },
      {
        id: 'find-103',
        applicationId: 'APP-8291',
        severity: 'POSITIVE',
        title: 'Sufficient Collateral Cushion (LTV 65.8%)',
        explanation: 'The residential property improvement project carries an appraised collateral valuation of ₹38,00,000 against requested loan of ₹25,00,000, establishing a conservative Loan-to-Value ratio of 65.8%.',
        observations: [
          { metric: 'Collateral Valuation', value: '₹38,00,000', source: 'Property Valuation Certificate', page: 2 },
          { metric: 'Calculated LTV', value: '65.8%', source: 'Financial Engine (Deterministic)', page: 1 }
        ],
        evidence: [
          { documentName: 'Govt_ID_KYC_Verification_Rahul.pdf', page: 4, quoteOrMetric: 'Property title clear of encumbrances; residential solar appraisal on file.' }
        ],
        recommendedReview: 'Verify second-charge or solar equipment mortgage filing.',
        status: 'FLAGGED',
        createdAt: '2026-09-28T14:22:00.000Z'
      }
    ]);

    // Initial Underwriting Findings for APP-9042 (Aman Verma - High Risk case)
    this.findings.set('APP-9042', [
      {
        id: 'find-201',
        applicationId: 'APP-9042',
        severity: 'HIGH',
        title: 'Severe Debt Burden: Proposed DTI Exceeds Safe Ceilings (162.7%)',
        explanation: 'Borrower already services ₹55,000/month in existing obligations against ₹82,000 monthly income (existing DTI 67.1%). Adding proposed ₹40L loan EMI of ₹78,416 pushes total obligations to ₹1,33,416/month (162.7% DTI), producing negative free cash flow.',
        observations: [
          { metric: 'Monthly Income', value: '₹82,000', source: 'ICICI_Current_Account_AmanVerma.pdf', page: 1 },
          { metric: 'Existing Debt', value: '₹55,000', source: 'CIBIL_Detailed_Report_Aman.pdf', page: 2 },
          { metric: 'New Loan EMI', value: '₹78,416', source: 'Financial Engine (Deterministic)', page: 1 },
          { metric: 'Proposed DTI', value: '162.7%', source: 'Financial Engine (Deterministic)', page: 1 }
        ],
        evidence: [
          { documentName: 'ICICI_Current_Account_AmanVerma.pdf', page: 1, quoteOrMetric: 'Net studio monthly turnover averages ₹82,000 over trailing 6 months.' },
          { documentName: 'CIBIL_Detailed_Report_Aman.pdf', page: 2, quoteOrMetric: 'Active equipment loan debit ₹35,000 + personal loan ₹20,000.' }
        ],
        recommendedReview: 'Restructure loan amount downward to maximum ₹12,00,000 or require co-applicant with independent verifiable income.',
        status: 'FLAGGED',
        createdAt: '2026-09-27T09:15:00.000Z'
      },
      {
        id: 'find-202',
        applicationId: 'APP-9042',
        severity: 'MEDIUM',
        title: 'Unexplained Lump Sum Deposit on Bank Statement',
        explanation: 'Bank statement reflects an isolated credit of ₹8,50,000 on August 14th without corresponding studio invoice or regular client contract billing.',
        observations: [
          { metric: 'Deposit Amount', value: '₹8,50,000', source: 'ICICI_Current_Account_AmanVerma.pdf', page: 4 },
          { metric: 'Average Balance', value: '₹1,20,000', source: 'ICICI_Current_Account_AmanVerma.pdf', page: 1 }
        ],
        evidence: [
          { documentName: 'ICICI_Current_Account_AmanVerma.pdf', page: 4, quoteOrMetric: 'NEFT credit TRN902812 from third-party individual account.' }
        ],
        recommendedReview: 'Request source of funds declaration and invoice contract for the ₹8.5L transaction.',
        status: 'FLAGGED',
        createdAt: '2026-09-27T09:15:00.000Z'
      }
    ]);

    // Initial Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        applicationId: 'APP-8291',
        actorId: 'usr-2',
        actorName: 'Sunita Rao',
        action: 'APPLICATION_CREATED',
        metadata: { borrowerName: 'Rahul Sharma', loanAmount: 2500000, loanPurpose: 'Home Improvement' },
        createdAt: '2026-09-20T08:30:00.000Z'
      },
      {
        id: 'aud-2',
        applicationId: 'APP-8291',
        actorId: 'usr-2',
        actorName: 'Sunita Rao',
        action: 'DOCUMENTS_UPLOADED',
        metadata: { count: 4, types: ['Bank Statement', 'Salary Slip', 'Tax Return', 'Identity Document'] },
        createdAt: '2026-09-20T08:39:00.000Z'
      },
      {
        id: 'aud-3',
        applicationId: 'APP-8291',
        actorId: 'usr-1',
        actorName: 'Arjun Kapoor',
        action: 'AI_ANALYSIS_COMPLETED',
        metadata: { findingsGenerated: 3, overallRisk: 'LOW', confidence: 0.96 },
        createdAt: '2026-09-28T14:22:00.000Z'
      },
      {
        id: 'aud-4',
        applicationId: 'APP-9042',
        actorId: 'usr-1',
        actorName: 'Arjun Kapoor',
        action: 'AI_ANALYSIS_COMPLETED',
        metadata: { findingsGenerated: 2, overallRisk: 'HIGH', confidence: 0.94 },
        createdAt: '2026-09-27T09:15:00.000Z'
      }
    ];
  }

  // --- Applications ---
  getAllApplications() {
    return Array.from(this.applications.values()).map(app => {
      const borrower = this.borrowers.get(app.borrowerId);
      return {
        ...app,
        borrowerName: borrower ? borrower.name : 'Unknown Borrower',
        borrowerEmail: borrower ? borrower.email : '',
        borrowerPhone: borrower ? borrower.phone : '',
        employmentType: borrower ? borrower.employmentType : '',
      };
    });
  }

  getApplication(id: string) {
    const app = this.applications.get(id);
    if (!app) return null;
    const borrower = this.borrowers.get(app.borrowerId);
    const docs = Array.from(this.documents.values()).filter(d => d.applicationId === id);
    const extracted = this.extractedData.get(id) || [];
    const appFindings = this.findings.get(id) || [];
    const memo = this.memos.get(id);

    // Compute deterministic financial metrics
    const emiResult = calculateEMI(app.loanAmount, app.interestRate, app.loanTenure);
    const dtiResult = calculateDTI(app.monthlyDebt, emiResult.value, app.monthlyIncome);
    const ltvResult = calculateLTV(app.loanAmount, app.collateralValue);
    const estimatedExpenses = Math.round(app.monthlyIncome * 0.25);
    const fcfResult = calculateFreeCashFlow(
      app.monthlyIncome,
      estimatedExpenses,
      app.monthlyDebt + emiResult.value
    );
    const dscrResult = calculateDSCR(
      app.monthlyIncome - estimatedExpenses,
      app.monthlyDebt + emiResult.value
    );

    // Evaluate policies deterministically
    const policies = evaluatePolicies({
      creditScore: app.creditScore,
      proposedDTI: dtiResult.proposedDTI.value,
      ltv: ltvResult.value,
      uploadedDocumentTypes: docs.map(d => d.documentType),
      monthlyIncome: app.monthlyIncome,
      yearsEmployed: borrower?.yearsEmployed || 1.0,
    });

    return {
      application: app,
      borrower,
      documents: docs,
      extractedFacts: extracted,
      findings: appFindings,
      memo: memo || null,
      policies,
      metrics: {
        emi: emiResult,
        existingDTI: dtiResult.existingDTI,
        proposedDTI: dtiResult.proposedDTI,
        ltv: ltvResult,
        freeCashFlow: fcfResult,
        dscr: dscrResult,
        estimatedLivingExpenses: estimatedExpenses,
      }
    };
  }

  createApplication(data: {
    borrower: Omit<Borrower, 'id' | 'createdAt'>;
    application: Omit<LoanApplication, 'id' | 'borrowerId' | 'overallRisk' | 'status' | 'createdAt' | 'updatedAt'>;
    initialDocuments?: Array<{ documentType: string; fileName: string; snippet?: string }>;
  }) {
    const borrowerId = `bor-${Date.now()}`;
    const borrower: Borrower = {
      ...data.borrower,
      id: borrowerId,
      createdAt: new Date().toISOString()
    };
    this.borrowers.set(borrowerId, borrower);

    const appId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: LoanApplication = {
      ...data.application,
      id: appId,
      borrowerId,
      overallRisk: 'PENDING',
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.applications.set(appId, newApp);

    // Initial documents if provided
    if (data.initialDocuments && data.initialDocuments.length > 0) {
      data.initialDocuments.forEach((doc, idx) => {
        const docId = `doc-${Date.now()}-${idx}`;
        const record: DocumentRecord = {
          id: docId,
          applicationId: appId,
          documentType: doc.documentType,
          fileName: doc.fileName,
          storagePath: `vault/${appId}/${doc.fileName}`,
          fileSizeBytes: 1024 * 1024 * (1 + idx),
          processingStatus: 'PROCESSED',
          createdAt: new Date().toISOString(),
          extractedSnippet: doc.snippet || `Verified ${doc.documentType} uploaded for underwriting.`
        };
        this.documents.set(docId, record);
      });
    }

    this.addAuditLog(appId, 'usr-1', 'Loan Officer', 'APPLICATION_CREATED', {
      loanAmount: newApp.loanAmount,
      purpose: newApp.loanPurpose,
      borrower: borrower.name,
    });

    return { application: newApp, borrower };
  }

  updateApplication(id: string, updates: Partial<LoanApplication>) {
    const app = this.applications.get(id);
    if (!app) return null;
    const updated = { ...app, ...updates, updatedAt: new Date().toISOString() };
    this.applications.set(id, updated);
    return updated;
  }

  // --- Documents ---
  addDocument(appId: string, doc: { documentType: string; fileName: string; fileSizeBytes?: number; snippet?: string }) {
    const docId = `doc-${Date.now()}`;
    const newDoc: DocumentRecord = {
      id: docId,
      applicationId: appId,
      documentType: doc.documentType,
      fileName: doc.fileName,
      storagePath: `vault/${appId}/${doc.fileName}`,
      fileSizeBytes: doc.fileSizeBytes || 1500000,
      processingStatus: 'PROCESSED',
      createdAt: new Date().toISOString(),
      extractedSnippet: doc.snippet || `Extracted details from ${doc.fileName}`
    };
    this.documents.set(docId, newDoc);

    this.addAuditLog(appId, 'usr-1', 'Loan Officer', 'DOCUMENT_UPLOADED', {
      documentType: doc.documentType,
      fileName: doc.fileName
    });

    return newDoc;
  }

  deleteDocument(docId: string) {
    const doc = this.documents.get(docId);
    if (!doc) return false;
    this.documents.delete(docId);
    this.addAuditLog(doc.applicationId, 'usr-1', 'Underwriter', 'DOCUMENT_DELETED', {
      fileName: doc.fileName
    });
    return true;
  }

  // --- Findings ---
  saveFindings(appId: string, newFindings: UnderwritingFinding[], overallRisk: 'LOW' | 'MEDIUM' | 'HIGH') {
    this.findings.set(appId, newFindings);
    const app = this.applications.get(appId);
    if (app) {
      app.overallRisk = overallRisk;
      app.updatedAt = new Date().toISOString();
      this.applications.set(appId, app);
    }

    this.addAuditLog(appId, 'usr-1', 'Underwriting Copilot', 'AI_ANALYSIS_COMPLETED', {
      findingsCount: newFindings.length,
      overallRisk
    });
  }

  updateFindingStatus(appId: string, findingId: string, status: 'FLAGGED' | 'REVIEWED' | 'DISMISSED', notes?: string) {
    const list = this.findings.get(appId) || [];
    const item = list.find(f => f.id === findingId);
    if (!item) return null;
    item.status = status;
    if (notes !== undefined) {
      item.reviewerNotes = notes;
    }
    this.addAuditLog(appId, 'usr-1', 'Underwriter', 'FINDING_REVIEWED', {
      findingId,
      title: item.title,
      status,
      notes
    });
    return item;
  }

  // --- Credit Memo ---
  saveCreditMemo(appId: string, content: CreditMemoContent, generatedBy = 'Lendy Copilot (AI-Assisted)') {
    const existing = this.memos.get(appId);
    const version = existing ? existing.version + 1 : 1;
    const memo: CreditMemo = {
      id: existing ? existing.id : `memo-${Date.now()}`,
      applicationId: appId,
      content,
      version,
      generatedBy,
      decision: existing?.decision,
      decisionNotes: existing?.decisionNotes,
      reviewedBy: existing?.reviewedBy,
      reviewedAt: existing?.reviewedAt,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.memos.set(appId, memo);

    this.addAuditLog(appId, 'usr-1', 'Underwriter', existing ? 'MEMO_EDITED' : 'MEMO_GENERATED', {
      version,
      generatedBy
    });
    return memo;
  }

  recordHumanDecision(appId: string, decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO', notes: string, reviewerName = 'Arjun Kapoor') {
    const app = this.applications.get(appId);
    if (!app) return null;

    if (decision === 'APPROVE') {
      app.status = 'APPROVED';
    } else if (decision === 'REJECT') {
      app.status = 'REJECTED';
    } else {
      app.status = 'INFO_REQUESTED';
    }
    app.updatedAt = new Date().toISOString();
    this.applications.set(appId, app);

    const memo = this.memos.get(appId);
    if (memo) {
      memo.decision = decision;
      memo.decisionNotes = notes;
      memo.reviewedBy = reviewerName;
      memo.reviewedAt = new Date().toISOString();
      this.memos.set(appId, memo);
    }

    this.addAuditLog(appId, 'usr-1', reviewerName, 'HUMAN_DECISION_RECORDED', {
      decision,
      notes,
      newStatus: app.status
    });

    return { application: app, memo };
  }

  // --- Audit Trail ---
  addAuditLog(applicationId: string | undefined, actorId: string, actorName: string, action: string, metadata: Record<string, any> = {}) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      applicationId,
      actorId,
      actorName,
      action,
      metadata,
      createdAt: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    return log;
  }

  getAuditLogs(applicationId?: string) {
    if (applicationId) {
      return this.auditLogs.filter(l => l.applicationId === applicationId);
    }
    return this.auditLogs;
  }
}

export const store = new InMemoryStore();
