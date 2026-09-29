-- LENDY — AI LOAN UNDERWRITING COPILOT
-- Supabase PostgreSQL Database Schema

-- 1. Users Table (Loan Officers, Underwriters, Admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('loan_officer', 'underwriter', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Borrowers Table
CREATE TABLE IF NOT EXISTS borrowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  employer TEXT NOT NULL,
  years_employed NUMERIC(4, 1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Loan Applications Table
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  loan_amount NUMERIC(14, 2) NOT NULL,
  loan_purpose TEXT NOT NULL,
  loan_tenure INTEGER NOT NULL, -- in months
  interest_rate NUMERIC(5, 2) NOT NULL, -- annual percentage
  credit_score INTEGER NOT NULL,
  overall_risk TEXT NOT NULL DEFAULT 'PENDING' CHECK (overall_risk IN ('LOW', 'MEDIUM', 'HIGH', 'PENDING')),
  status TEXT NOT NULL DEFAULT 'UNDER_REVIEW' CHECK (status IN ('UNDER_REVIEW', 'NEEDS_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'INFO_REQUESTED')),
  assigned_officer UUID REFERENCES users(id),
  collateral_value NUMERIC(14, 2) DEFAULT 0,
  monthly_income NUMERIC(12, 2) NOT NULL,
  monthly_debt NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  processing_status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK (processing_status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Extracted Financial Data (Evidence layer fields)
CREATE TABLE IF NOT EXISTS extracted_financial_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  field_value TEXT NOT NULL,
  source_page INTEGER DEFAULT 1,
  confidence NUMERIC(4, 3) DEFAULT 0.95,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Financial Metrics (Computed deterministically)
CREATE TABLE IF NOT EXISTS financial_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(14, 4) NOT NULL,
  formula TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Underwriting Findings (AI observations with strict evidence links)
CREATE TABLE IF NOT EXISTS underwriting_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW', 'POSITIVE')),
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  observations JSONB NOT NULL DEFAULT '[]',
  evidence JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'FLAGGED' CHECK (status IN ('FLAGGED', 'REVIEWED', 'DISMISSED')),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Policy Checks
CREATE TABLE IF NOT EXISTS policy_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('PASS', 'REVIEW', 'FAIL')),
  value TEXT NOT NULL,
  threshold TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Credit Memos
CREATE TABLE IF NOT EXISTS credit_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  generated_by TEXT NOT NULL DEFAULT 'Lendy Copilot (AI-Assisted)',
  decision TEXT CHECK (decision IN ('APPROVE', 'REJECT', 'REQUEST_INFO')),
  decision_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES loan_applications(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id),
  actor_name TEXT NOT NULL DEFAULT 'Underwriter',
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_applications_borrower ON loan_applications(borrower_id);
CREATE INDEX IF NOT EXISTS idx_documents_app ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_findings_app ON underwriting_findings(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_app ON audit_logs(application_id);
