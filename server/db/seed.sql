-- LENDY — AI LOAN UNDERWRITING COPILOT
-- Seed Data for Supabase PostgreSQL Database

-- 1. Insert Team Users
INSERT INTO users (id, name, email, role) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Arjun Kapoor', 'arjun.kapoor@lendy.finance', 'underwriter'),
  ('a2222222-2222-2222-2222-222222222222', 'Sunita Rao', 'sunita.rao@lendy.finance', 'loan_officer'),
  ('a3333333-3333-3333-3333-333333333333', 'Devon Patel', 'devon.patel@lendy.finance', 'admin');

-- 2. Insert Borrowers
INSERT INTO borrowers (id, name, date_of_birth, phone, email, employment_type, employer, years_employed) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Rahul Sharma', '1989-04-12', '+91 98201 44521', 'rahul.sharma@techcorp.in', 'Salaried - Full Time', 'Infosys Technologies Ltd', 4.5),
  ('b2222222-2222-2222-2222-222222222222', 'Aman Verma', '1992-11-23', '+91 98112 77341', 'aman.verma@craftworks.co', 'Self-Employed / Business', 'Craftworks Digital Studio', 1.2),
  ('b3333333-3333-3333-3333-333333333333', 'Priya Mehta', '1995-07-08', '+91 97334 11982', 'priya.mehta@fintechlabs.io', 'Salaried - Full Time', 'HDFC ERGO General Insurance', 3.0),
  ('b4444444-4444-4444-4444-444444444444', 'Vikram Malhotra', '1984-02-19', '+91 98450 33219', 'vikram.m@zenithlogistics.in', 'Director / Business', 'Zenith Freight Logistics LLP', 8.0),
  ('b5555555-5555-5555-5555-555555555555', 'Ananya Sen', '1993-09-30', '+91 98701 55662', 'ananya.sen@healthplus.org', 'Professional / Doctor', 'Apollo Multi-Specialty Hospital', 5.0);

-- 3. Insert Loan Applications
INSERT INTO loan_applications (id, borrower_id, loan_amount, loan_purpose, loan_tenure, interest_rate, credit_score, overall_risk, status, assigned_officer, collateral_value, monthly_income, monthly_debt) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 2500000, 'Home Improvement & Solar Installation', 60, 9.50, 742, 'LOW', 'UNDER_REVIEW', 'a1111111-1111-1111-1111-111111111111', 3800000, 145000, 28000),
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 4000000, 'Commercial Studio Expansion', 48, 12.25, 621, 'HIGH', 'NEEDS_REVIEW', 'a1111111-1111-1111-1111-111111111111', 2500000, 82000, 55000),
  ('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 1800000, 'Higher Education Financing', 36, 10.50, 718, 'MEDIUM', 'PENDING_DOCUMENTS', 'a2222222-2222-2222-2222-222222222222', 2200000, 110000, 32000),
  ('c4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 7500000, 'Fleet Machinery Acquisition', 72, 8.75, 785, 'LOW', 'APPROVED', 'a1111111-1111-1111-1111-111111111111', 12000000, 350000, 85000),
  ('c5555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 3000000, 'Medical Equipment Lease Buyout', 60, 9.25, 690, 'MEDIUM', 'UNDER_REVIEW', 'a2222222-2222-2222-2222-222222222222', 4500000, 190000, 68000);

-- 4. Insert Verified Evidence Documents
INSERT INTO documents (id, application_id, document_type, file_name, storage_path, processing_status) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Bank Statement', 'HDFC_Bank_Statement_6M_RahulSharma.pdf', 'docs/c1/hdfc_6m.pdf', 'PROCESSED'),
  ('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Salary Slip', 'Salary_Slips_Q3_Infosys_Rahul.pdf', 'docs/c1/salary_q3.pdf', 'PROCESSED'),
  ('d3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Tax Return', 'ITR_V_AY2025_26_RahulSharma.pdf', 'docs/c1/itr_v.pdf', 'PROCESSED'),
  ('d4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Identity Document', 'Aadhaar_PAN_KYC_Rahul.pdf', 'docs/c1/kyc.pdf', 'PROCESSED'),
  ('d5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Bank Statement', 'ICICI_Current_Account_AmanVerma.pdf', 'docs/c2/icici_statement.pdf', 'PROCESSED'),
  ('d6666666-6666-6666-6666-666666666666', 'c2222222-2222-2222-2222-222222222222', 'Credit Report', 'CIBIL_Detailed_Report_Aman.pdf', 'docs/c2/cibil_report.pdf', 'PROCESSED'),
  ('d7777777-7777-7777-7777-777777777777', 'c3333333-3333-3333-3333-333333333333', 'Salary Slip', 'Salary_Slips_Oct_Dec_Priya.pdf', 'docs/c3/salary_priya.pdf', 'PROCESSED'),
  ('d8888888-8888-8888-8888-888888888888', 'c4444444-4444-4444-4444-444444444444', 'Audited Financials', 'Zenith_Audited_BalanceSheet_FY25.pdf', 'docs/c4/audited_fs.pdf', 'PROCESSED'),
  ('d9999999-9999-9999-9999-999999999999', 'c4444444-4444-4444-4444-444444444444', 'Tax Return', 'Corporate_ITR_Zenith_AY25.pdf', 'docs/c4/corp_itr.pdf', 'PROCESSED'),
  ('daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c5555555-5555-5555-5555-555555555555', 'Bank Statement', 'SBI_Professional_Account_AnanyaSen.pdf', 'docs/c5/sbi_stmt.pdf', 'PROCESSED');
