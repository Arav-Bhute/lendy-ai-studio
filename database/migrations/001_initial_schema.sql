-- LENDY — AI LOAN UNDERWRITING COPILOT
-- Migration: 001_initial_schema.sql
-- Complete Supabase PostgreSQL Schema with RLS and Storage Bucket Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('loan_officer', 'underwriter', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BORROWERS
CREATE TABLE IF NOT EXISTS public.borrowers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  employer TEXT NOT NULL,
  years_employed NUMERIC(4, 1) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOAN APPLICATIONS
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id TEXT PRIMARY KEY,
  borrower_id UUID NOT NULL REFERENCES public.borrowers(id) ON DELETE CASCADE,
  loan_amount NUMERIC(14, 2) NOT NULL,
  loan_purpose TEXT NOT NULL,
  loan_tenure INTEGER NOT NULL, -- in months
  interest_rate NUMERIC(5, 2) NOT NULL, -- annual percentage
  credit_score INTEGER NOT NULL,
  overall_risk TEXT NOT NULL DEFAULT 'PENDING' CHECK (overall_risk IN ('LOW', 'MEDIUM', 'HIGH', 'PENDING')),
  status TEXT NOT NULL DEFAULT 'UNDER_REVIEW' CHECK (status IN ('UNDER_REVIEW', 'NEEDS_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'INFO_REQUESTED')),
  assigned_officer TEXT DEFAULT 'Arjun Kapoor',
  collateral_value NUMERIC(14, 2) DEFAULT 0,
  monthly_income NUMERIC(12, 2) NOT NULL,
  monthly_debt NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  processing_status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK (processing_status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED')),
  extracted_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXTRACTED FINANCIAL DATA
CREATE TABLE IF NOT EXISTS public.extracted_financial_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  field_value TEXT NOT NULL,
  source_page INTEGER DEFAULT 1,
  confidence NUMERIC(4, 3) DEFAULT 0.95,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FINANCIAL METRICS
CREATE TABLE IF NOT EXISTS public.financial_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(14, 4) NOT NULL,
  formula TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. UNDERWRITING FINDINGS
CREATE TABLE IF NOT EXISTS public.underwriting_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW', 'POSITIVE')),
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  observations JSONB NOT NULL DEFAULT '[]',
  evidence JSONB NOT NULL DEFAULT '[]',
  recommended_review TEXT,
  status TEXT NOT NULL DEFAULT 'FLAGGED' CHECK (status IN ('FLAGGED', 'REVIEWED', 'DISMISSED')),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. POLICY CHECKS
CREATE TABLE IF NOT EXISTS public.policy_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('PASS', 'REVIEW', 'FAIL')),
  value TEXT NOT NULL,
  threshold TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CREDIT MEMOS
CREATE TABLE IF NOT EXISTS public.credit_memos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  generated_by TEXT NOT NULL DEFAULT 'Lendy Copilot (AI-Assisted)',
  decision TEXT CHECK (decision IN ('APPROVE', 'REJECT', 'REQUEST_INFO')),
  decision_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT REFERENCES public.loan_applications(id) ON DELETE SET NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL DEFAULT 'Underwriter',
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_loan_applications_borrower ON public.loan_applications(borrower_id);
CREATE INDEX IF NOT EXISTS idx_documents_app ON public.documents(application_id);
CREATE INDEX IF NOT EXISTS idx_findings_app ON public.underwriting_findings(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_app ON public.audit_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_metrics_app ON public.financial_metrics(application_id);
CREATE INDEX IF NOT EXISTS idx_policies_app ON public.policy_checks(application_id);

-- ----------------------------------------------------
-- SUPABASE STORAGE BUCKET: loan-documents
-- ----------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'loan-documents',
  'loan-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760;

-- ----------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.underwriting_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full unrestricted access
CREATE POLICY "Service Role Full Access Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Borrowers" ON public.borrowers FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Applications" ON public.loan_applications FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Service Role Full Access ExtractedData" ON public.extracted_financial_data FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Metrics" ON public.financial_metrics FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Findings" ON public.underwriting_findings FOR ALL USING (true);
CREATE POLICY "Service Role Full Access PolicyChecks" ON public.policy_checks FOR ALL USING (true);
CREATE POLICY "Service Role Full Access CreditMemos" ON public.credit_memos FOR ALL USING (true);
CREATE POLICY "Service Role Full Access AuditLogs" ON public.audit_logs FOR ALL USING (true);

-- Authenticated Underwriter / Officer Read Policies
CREATE POLICY "Authenticated Staff Read Users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Staff Read Applications" ON public.loan_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Staff Read Borrowers" ON public.borrowers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Staff Read Documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Staff Read Findings" ON public.underwriting_findings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Staff Read Policies" ON public.policy_checks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Staff Read Memos" ON public.credit_memos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Staff Read Audits" ON public.audit_logs FOR SELECT TO authenticated USING (true);

-- Automatic Auth User to public.users Sync Trigger
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'underwriter')
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
END $$;

-- Storage bucket access policies
CREATE POLICY "Staff Document Read Access" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'loan-documents');
CREATE POLICY "Staff Document Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'loan-documents');
