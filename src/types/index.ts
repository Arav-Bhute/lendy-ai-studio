export type RiskSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'POSITIVE';
export type ApplicationStatus = 'UNDER_REVIEW' | 'NEEDS_REVIEW' | 'PENDING_DOCUMENTS' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
export type PolicyResult = 'PASS' | 'REVIEW' | 'FAIL';
export type DecisionType = 'APPROVE' | 'REJECT' | 'REQUEST_INFO';

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
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  employmentType?: string;
  loanAmount: number;
  loanPurpose: string;
  loanTenure: number; // months
  interestRate: number; // %
  creditScore: number;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'PENDING';
  status: ApplicationStatus;
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

export interface MetricDetail {
  value: number;
  formatted: string;
  formula: string;
  inputs: Record<string, any>;
  explanation: string;
}

export interface FinancialMetrics {
  emi: MetricDetail;
  existingDTI: MetricDetail;
  proposedDTI: MetricDetail;
  ltv: MetricDetail;
  freeCashFlow: MetricDetail;
  dscr: MetricDetail;
  estimatedLivingExpenses: number;
}

export interface PolicyCheck {
  policyName: string;
  result: PolicyResult;
  value: string | number;
  threshold: string;
  explanation: string;
}

export interface UnderwritingFinding {
  id: string;
  applicationId: string;
  severity: RiskSeverity;
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
  decision?: DecisionType;
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

export interface ApplicationWorkspaceData {
  application: LoanApplication;
  borrower: Borrower;
  documents: DocumentRecord[];
  extractedFacts: Array<{
    id: string;
    documentName: string;
    fieldName: string;
    fieldValue: string;
    sourcePage: number;
    confidence: number;
  }>;
  findings: UnderwritingFinding[];
  memo: CreditMemo | null;
  policies: PolicyCheck[];
  metrics: FinancialMetrics;
}
