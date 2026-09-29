-- LENDY — AI LOAN UNDERWRITING COPILOT
-- Seed Data for Supabase PostgreSQL Database (database/seed.sql)
-- Fictional synthetic borrowers only.

-- 1. Users
INSERT INTO public.users (id, name, email, role) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Arjun Kapoor', 'arjun.kapoor@lendy.finance', 'underwriter'),
  ('a2222222-2222-2222-2222-222222222222', 'Sunita Rao', 'sunita.rao@lendy.finance', 'loan_officer'),
  ('a3333333-3333-3333-3333-333333333333', 'Devon Patel', 'devon.patel@lendy.finance', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 2. Borrowers
INSERT INTO public.borrowers (id, name, date_of_birth, phone, email, employment_type, employer, years_employed) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Rahul Sharma', '1989-04-12', '+91 98201 44521', 'rahul.sharma@techcorp.in', 'Salaried - Full Time', 'Infosys Technologies Ltd', 4.5),
  ('b2222222-2222-2222-2222-222222222222', 'Aman Verma', '1992-11-23', '+91 98112 77341', 'aman.verma@craftworks.co', 'Self-Employed / Business', 'Craftworks Digital Studio', 1.2),
  ('b3333333-3333-3333-3333-333333333333', 'Priya Mehta', '1995-07-08', '+91 97334 11982', 'priya.mehta@fintechlabs.io', 'Salaried - Full Time', 'HDFC ERGO General Insurance', 3.0),
  ('b4444444-4444-4444-4444-444444444444', 'Vikram Malhotra', '1984-02-19', '+91 98450 33219', 'vikram.m@zenithlogistics.in', 'Director / Business', 'Zenith Freight Logistics LLP', 8.0),
  ('b5555555-5555-5555-5555-555555555555', 'Ananya Sen', '1993-09-30', '+91 98701 55662', 'ananya.sen@healthplus.org', 'Professional / Doctor', 'Apollo Multi-Specialty Hospital', 5.0)
ON CONFLICT (id) DO NOTHING;

-- 3. Loan Applications
INSERT INTO public.loan_applications (id, borrower_id, loan_amount, loan_purpose, loan_tenure, interest_rate, credit_score, overall_risk, status, assigned_officer, collateral_value, monthly_income, monthly_debt) VALUES
  ('APP-8291', 'b1111111-1111-1111-1111-111111111111', 2500000, 'Home Improvement & Solar Energy Installation', 60, 9.50, 742, 'LOW', 'UNDER_REVIEW', 'Arjun Kapoor', 3800000, 145000, 28000),
  ('APP-9042', 'b2222222-2222-2222-2222-222222222222', 4000000, 'Commercial Studio Expansion & Rigging', 48, 12.25, 621, 'HIGH', 'NEEDS_REVIEW', 'Arjun Kapoor', 2500000, 82000, 55000),
  ('APP-7619', 'b3333333-3333-3333-3333-333333333333', 1800000, 'Higher Education Executive Masters Program', 36, 10.50, 718, 'MEDIUM', 'PENDING_DOCUMENTS', 'Sunita Rao', 2200000, 110000, 32000),
  ('APP-6550', 'b4444444-4444-4444-4444-444444444444', 7500000, 'Fleet Machinery & Crane Replacement', 72, 8.75, 785, 'LOW', 'APPROVED', 'Arjun Kapoor', 12000000, 350000, 85000),
  ('APP-5412', 'b5555555-5555-5555-5555-555555555555', 3000000, 'Diagnostic Ultrasound Equipment Upgrade', 60, 9.25, 690, 'MEDIUM', 'UNDER_REVIEW', 'Sunita Rao', 4500000, 190000, 68000)
ON CONFLICT (id) DO UPDATE SET
  loan_amount = EXCLUDED.loan_amount,
  status = EXCLUDED.status;

-- 4. Documents in loan-documents bucket
INSERT INTO public.documents (id, application_id, document_type, file_name, storage_path, file_size_bytes, processing_status, extracted_snippet) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'APP-8291', 'Bank Statement', 'HDFC_Salary_Account_6M_RahulSharma.pdf', 'loan-documents/APP-8291/hdfc_6m.pdf', 2420000, 'PROCESSED', 'Regular monthly salary credit ₹1,45,000 on 30th of each month. Average monthly balance ₹2,80,000.'),
  ('d2222222-2222-2222-2222-222222222222', 'APP-8291', 'Salary Slip', 'Infosys_Salary_Slips_Q3_Rahul.pdf', 'loan-documents/APP-8291/salary_q3.pdf', 980000, 'PROCESSED', 'Gross monthly pay ₹1,65,000; Net take-home ₹1,45,000 after PF & TDS deductions.'),
  ('d3333333-3333-3333-3333-333333333333', 'APP-8291', 'Tax Return', 'ITR_V_AY2025_26_RahulSharma.pdf', 'loan-documents/APP-8291/itr_v.pdf', 1250000, 'PROCESSED', 'Gross Total Income acknowledged: ₹19,80,000 for assessment year 2025-26.'),
  ('d4444444-4444-4444-4444-444444444444', 'APP-8291', 'Identity Document', 'Govt_ID_KYC_Verification_Rahul.pdf', 'loan-documents/APP-8291/kyc.pdf', 450000, 'PROCESSED', 'PAN and Aadhaar identity verified. Residential address matches application.'),
  ('d5555555-5555-5555-5555-555555555555', 'APP-9042', 'Bank Statement', 'ICICI_Current_Account_AmanVerma.pdf', 'loan-documents/APP-9042/icici_statement.pdf', 3100000, 'PROCESSED', 'Volatile month-end balances. Unexplained lump sum deposit of ₹8,50,000 noted on page 4.'),
  ('d6666666-6666-6666-6666-666666666666', 'APP-9042', 'Credit Report', 'CIBIL_Detailed_Report_Aman.pdf', 'loan-documents/APP-9042/cibil_report.pdf', 890000, 'PROCESSED', 'Credit score 621. Two 30-day past-due marks on revolving retail credit cards over trailing 12 months.')
ON CONFLICT (id) DO NOTHING;

-- 5. Extracted Financial Data
INSERT INTO public.extracted_financial_data (id, application_id, document_id, field_name, field_value, source_page, confidence) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'APP-8291', 'd1111111-1111-1111-1111-111111111111', 'Verified Monthly Inflow', '₹1,45,000 / month', 2, 0.98),
  ('e2222222-2222-2222-2222-222222222222', 'APP-8291', 'd1111111-1111-1111-1111-111111111111', 'Existing Auto Loan Debit', '₹28,000 / month', 3, 0.96),
  ('e3333333-3333-3333-3333-333333333333', 'APP-8291', 'd2222222-2222-2222-2222-222222222222', 'Employer Stability', 'Infosys - 4.5 Years Tenured', 1, 0.99),
  ('e4444444-4444-4444-4444-444444444444', 'APP-8291', 'd3333333-3333-3333-3333-333333333333', 'Annual Gross Taxable Income', '₹19,80,000', 1, 0.99)
ON CONFLICT (id) DO NOTHING;

-- 6. Underwriting Findings
INSERT INTO public.underwriting_findings (id, application_id, severity, title, explanation, observations, evidence, recommended_review, status) VALUES
  (
    'f1111111-1111-1111-1111-111111111111',
    'APP-8291',
    'POSITIVE',
    'Strong Primary Income Stability & Bureau Profile',
    'Borrower demonstrates 4.5 years of continuous employment at Infosys with steady ₹1,45,000 monthly take-home salary and an excellent credit bureau score of 742.',
    '[{"metric": "Credit Score", "value": "742", "source": "CIBIL Bureau Pull", "page": 1}, {"metric": "Employer Tenure", "value": "4.5 Years", "source": "Infosys_Salary_Slips_Q3_Rahul.pdf", "page": 1}]'::jsonb,
    '[{"documentName": "Infosys_Salary_Slips_Q3_Rahul.pdf", "page": 1, "quoteOrMetric": "Tenure verified: 4 years, 6 months in engineering division."}, {"documentName": "HDFC_Salary_Account_6M_RahulSharma.pdf", "page": 2, "quoteOrMetric": "Consistent payroll credits from Infosys Ltd on 30th of each month."}]'::jsonb,
    'Routine income re-verification during final sign-off.',
    'FLAGGED'
  ),
  (
    'f2222222-2222-2222-2222-222222222222',
    'APP-8291',
    'LOW',
    'Comfortable Debt Service & Post-Loan Cash Buffer',
    'Proposed loan creates an EMI of ₹52,505. Combined debt servicing reaches ₹80,505, resulting in a proposed DTI of 55.5%. After living expenses, borrower retains ₹28,245 in free monthly cash flow.',
    '[{"metric": "New Loan EMI", "value": "₹52,505", "source": "Financial Engine (Deterministic)", "page": 1}, {"metric": "Proposed DTI", "value": "55.5%", "source": "Financial Engine (Deterministic)", "page": 1}]'::jsonb,
    '[{"documentName": "HDFC_Salary_Account_6M_RahulSharma.pdf", "page": 3, "quoteOrMetric": "Existing auto loan debit ₹28,000 scheduled through Dec 2027."}]'::jsonb,
    'Confirm if auto loan has pre-payment options.',
    'FLAGGED'
  ),
  (
    'f3333333-3333-3333-3333-333333333333',
    'APP-9042',
    'HIGH',
    'Severe Debt Burden: Proposed DTI Exceeds Safe Ceilings (162.7%)',
    'Borrower already services ₹55,000/month in existing obligations against ₹82,000 monthly income. Adding proposed facility pushes total obligations to ₹1,33,416/month (162.7% DTI), producing negative cash flow.',
    '[{"metric": "Monthly Income", "value": "₹82,000", "source": "ICICI_Current_Account_AmanVerma.pdf", "page": 1}, {"metric": "Proposed DTI", "value": "162.7%", "source": "Financial Engine (Deterministic)", "page": 1}]'::jsonb,
    '[{"documentName": "ICICI_Current_Account_AmanVerma.pdf", "page": 1, "quoteOrMetric": "Net studio monthly turnover averages ₹82,000 over trailing 6 months."}]'::jsonb,
    'Restructure loan amount downward to maximum ₹12,00,000 or require co-applicant with independent income.',
    'FLAGGED'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. Audit Logs
INSERT INTO public.audit_logs (id, application_id, actor_id, actor_name, action, metadata) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'APP-8291', 'usr-2', 'Sunita Rao', 'APPLICATION_CREATED', '{"borrowerName": "Rahul Sharma", "loanAmount": 2500000}'::jsonb),
  ('a0000002-0000-0000-0000-000000000002', 'APP-8291', 'usr-2', 'Sunita Rao', 'DOCUMENTS_UPLOADED', '{"count": 4, "types": ["Bank Statement", "Salary Slip", "Tax Return", "Identity Document"]}'::jsonb),
  ('a0000003-0000-0000-0000-000000000003', 'APP-8291', 'usr-1', 'Arjun Kapoor', 'AI_ANALYSIS_COMPLETED', '{"findingsGenerated": 3, "overallRisk": "LOW"}'::jsonb),
  ('a0000004-0000-0000-0000-000000000004', 'APP-9042', 'usr-1', 'Arjun Kapoor', 'AI_ANALYSIS_COMPLETED', '{"findingsGenerated": 2, "overallRisk": "HIGH"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
