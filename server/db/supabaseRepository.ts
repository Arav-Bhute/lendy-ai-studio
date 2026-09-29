import { getSupabase, isSupabaseReady, ensureLoanDocumentsBucket, LOAN_DOCUMENTS_BUCKET } from './supabase.js';
import type {
  Borrower,
  LoanApplication,
  DocumentRecord,
  UnderwritingFinding,
  CreditMemo,
  CreditMemoContent,
  AuditLog,
  ExtractedFact,
} from './store.js';

/**
 * Supabase Data Repository
 * Performs direct PostgreSQL queries and storage operations via @supabase/supabase-js.
 */
export const supabaseRepo = {
  async init(): Promise<boolean> {
    if (!isSupabaseReady()) return false;
    const client = getSupabase();
    if (!client) return false;

    try {
      await ensureLoanDocumentsBucket();

      // Check if loan_applications table has data; if empty, seed initial data
      const { data: apps, error } = await client.from('loan_applications').select('id').limit(1);
      if (error) {
        console.warn('Supabase query error on init check:', error.message);
        return false;
      }

      if (!apps || apps.length === 0) {
        console.log('🌱 Seeding Supabase database with initial synthetic records...');
        await this.seedSupabase();
      } else {
        console.log(`✅ Supabase database online with existing applications.`);
      }
      return true;
    } catch (err: any) {
      console.warn('Failed to initialize Supabase repository:', err.message);
      return false;
    }
  },

  async seedSupabase(): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    try {
      // 1. Users
      await client.from('users').upsert([
        { id: 'a1111111-1111-1111-1111-111111111111', name: 'Arjun Kapoor', email: 'arjun.kapoor@lendy.finance', role: 'underwriter' },
        { id: 'a2222222-2222-2222-2222-222222222222', name: 'Sunita Rao', email: 'sunita.rao@lendy.finance', role: 'loan_officer' },
        { id: 'a3333333-3333-3333-3333-333333333333', name: 'Devon Patel', email: 'devon.patel@lendy.finance', role: 'admin' },
      ]);

      // 2. Borrowers
      await client.from('borrowers').upsert([
        {
          id: 'b1111111-1111-1111-1111-111111111111',
          name: 'Rahul Sharma',
          date_of_birth: '1989-04-12',
          phone: '+91 98201 44521',
          email: 'rahul.sharma@techcorp.in',
          employment_type: 'Salaried - Full Time',
          employer: 'Infosys Technologies Ltd',
          years_employed: 4.5,
        },
        {
          id: 'b2222222-2222-2222-2222-222222222222',
          name: 'Aman Verma',
          date_of_birth: '1992-11-23',
          phone: '+91 98112 77341',
          email: 'aman.verma@craftworks.co',
          employment_type: 'Self-Employed / Business',
          employer: 'Craftworks Digital Studio',
          years_employed: 1.2,
        },
        {
          id: 'b3333333-3333-3333-3333-333333333333',
          name: 'Priya Mehta',
          date_of_birth: '1995-07-08',
          phone: '+91 97334 11982',
          email: 'priya.mehta@fintechlabs.io',
          employment_type: 'Salaried - Full Time',
          employer: 'HDFC ERGO General Insurance',
          years_employed: 3.0,
        },
        {
          id: 'b4444444-4444-4444-4444-444444444444',
          name: 'Vikram Malhotra',
          date_of_birth: '1984-02-19',
          phone: '+91 98450 33219',
          email: 'vikram.m@zenithlogistics.in',
          employment_type: 'Director / Business',
          employer: 'Zenith Freight Logistics LLP',
          years_employed: 8.0,
        },
        {
          id: 'b5555555-5555-5555-5555-555555555555',
          name: 'Ananya Sen',
          date_of_birth: '1993-09-30',
          phone: '+91 98701 55662',
          email: 'ananya.sen@healthplus.org',
          employment_type: 'Professional / Doctor',
          employer: 'Apollo Multi-Specialty Hospital',
          years_employed: 5.0,
        },
      ]);

      // 3. Applications
      await client.from('loan_applications').upsert([
        {
          id: 'APP-8291',
          borrower_id: 'b1111111-1111-1111-1111-111111111111',
          loan_amount: 2500000,
          loan_purpose: 'Home Improvement & Solar Energy Installation',
          loan_tenure: 60,
          interest_rate: 9.50,
          credit_score: 742,
          overall_risk: 'LOW',
          status: 'UNDER_REVIEW',
          assigned_officer: 'Arjun Kapoor',
          collateral_value: 3800000,
          monthly_income: 145000,
          monthly_debt: 28000,
        },
        {
          id: 'APP-9042',
          borrower_id: 'b2222222-2222-2222-2222-222222222222',
          loan_amount: 4000000,
          loan_purpose: 'Commercial Studio Expansion & Rigging',
          loan_tenure: 48,
          interest_rate: 12.25,
          credit_score: 621,
          overall_risk: 'HIGH',
          status: 'NEEDS_REVIEW',
          assigned_officer: 'Arjun Kapoor',
          collateral_value: 2500000,
          monthly_income: 82000,
          monthly_debt: 55000,
        },
        {
          id: 'APP-7619',
          borrower_id: 'b3333333-3333-3333-3333-333333333333',
          loan_amount: 1800000,
          loan_purpose: 'Higher Education Executive Masters Program',
          loan_tenure: 36,
          interest_rate: 10.50,
          credit_score: 718,
          overall_risk: 'MEDIUM',
          status: 'PENDING_DOCUMENTS',
          assigned_officer: 'Sunita Rao',
          collateral_value: 2200000,
          monthly_income: 110000,
          monthly_debt: 32000,
        },
        {
          id: 'APP-6550',
          borrower_id: 'b4444444-4444-4444-4444-444444444444',
          loan_amount: 7500000,
          loan_purpose: 'Fleet Machinery & Crane Replacement',
          loan_tenure: 72,
          interest_rate: 8.75,
          credit_score: 785,
          overall_risk: 'LOW',
          status: 'APPROVED',
          assigned_officer: 'Arjun Kapoor',
          collateral_value: 12000000,
          monthly_income: 350000,
          monthly_debt: 85000,
        },
        {
          id: 'APP-5412',
          borrower_id: 'b5555555-5555-5555-5555-555555555555',
          loan_amount: 3000000,
          loan_purpose: 'Diagnostic Ultrasound Equipment Upgrade',
          loan_tenure: 60,
          interest_rate: 9.25,
          credit_score: 690,
          overall_risk: 'MEDIUM',
          status: 'UNDER_REVIEW',
          assigned_officer: 'Sunita Rao',
          collateral_value: 4500000,
          monthly_income: 190000,
          monthly_debt: 68000,
        },
      ]);

      // 4. Documents
      await client.from('documents').upsert([
        {
          id: 'd1111111-1111-1111-1111-111111111111',
          application_id: 'APP-8291',
          document_type: 'Bank Statement',
          file_name: 'HDFC_Salary_Account_6M_RahulSharma.pdf',
          storage_path: `${LOAN_DOCUMENTS_BUCKET}/APP-8291/hdfc_6m.pdf`,
          file_size_bytes: 2420000,
          processing_status: 'PROCESSED',
          extracted_snippet: 'Regular monthly salary credit ₹1,45,000 on 30th of each month. Average monthly balance ₹2,80,000.',
        },
        {
          id: 'd2222222-2222-2222-2222-222222222222',
          application_id: 'APP-8291',
          document_type: 'Salary Slip',
          file_name: 'Infosys_Salary_Slips_Q3_Rahul.pdf',
          storage_path: `${LOAN_DOCUMENTS_BUCKET}/APP-8291/salary_q3.pdf`,
          file_size_bytes: 980000,
          processing_status: 'PROCESSED',
          extracted_snippet: 'Gross monthly pay ₹1,65,000; Net take-home ₹1,45,000 after PF & TDS deductions.',
        },
        {
          id: 'd3333333-3333-3333-3333-333333333333',
          application_id: 'APP-8291',
          document_type: 'Tax Return',
          file_name: 'ITR_V_AY2025_26_RahulSharma.pdf',
          storage_path: `${LOAN_DOCUMENTS_BUCKET}/APP-8291/itr_v.pdf`,
          file_size_bytes: 1250000,
          processing_status: 'PROCESSED',
          extracted_snippet: 'Gross Total Income acknowledged: ₹19,80,000 for assessment year 2025-26.',
        },
        {
          id: 'd4444444-4444-4444-4444-444444444444',
          application_id: 'APP-8291',
          document_type: 'Identity Document',
          file_name: 'Govt_ID_KYC_Verification_Rahul.pdf',
          storage_path: `${LOAN_DOCUMENTS_BUCKET}/APP-8291/kyc.pdf`,
          file_size_bytes: 450000,
          processing_status: 'PROCESSED',
          extracted_snippet: 'PAN and Aadhaar identity verified. Residential address matches application.',
        },
      ]);

      // 5. Findings
      await client.from('underwriting_findings').upsert([
        {
          id: 'f1111111-1111-1111-1111-111111111111',
          application_id: 'APP-8291',
          severity: 'POSITIVE',
          title: 'Strong Primary Income Stability & Bureau Profile',
          explanation: 'Borrower demonstrates 4.5 years of continuous employment at Infosys with steady ₹1,45,000 monthly take-home salary and an excellent credit bureau score of 742.',
          observations: [
            { metric: 'Credit Score', value: '742', source: 'CIBIL Bureau Pull', page: 1 },
            { metric: 'Employer Tenure', value: '4.5 Years', source: 'Infosys_Salary_Slips_Q3_Rahul.pdf', page: 1 },
          ],
          evidence: [
            { documentName: 'Infosys_Salary_Slips_Q3_Rahul.pdf', page: 1, quoteOrMetric: 'Tenure verified: 4 years, 6 months in engineering division.' },
            { documentName: 'HDFC_Salary_Account_6M_RahulSharma.pdf', page: 2, quoteOrMetric: 'Consistent payroll credits from Infosys Ltd on 30th of each month.' },
          ],
          status: 'FLAGGED',
        },
        {
          id: 'f2222222-2222-2222-2222-222222222222',
          application_id: 'APP-8291',
          severity: 'LOW',
          title: 'Comfortable Debt Service & Post-Loan Cash Buffer',
          explanation: 'Proposed loan creates an EMI of ₹52,505. Combined debt servicing reaches ₹80,505, resulting in a proposed DTI of 55.5%. After living expenses, borrower retains ₹28,245 in free monthly cash flow.',
          observations: [
            { metric: 'New Loan EMI', value: '₹52,505', source: 'Financial Engine (Deterministic)', page: 1 },
            { metric: 'Proposed DTI', value: '55.5%', source: 'Financial Engine (Deterministic)', page: 1 },
          ],
          evidence: [
            { documentName: 'HDFC_Salary_Account_6M_RahulSharma.pdf', page: 3, quoteOrMetric: 'Existing auto loan debit ₹28,000 scheduled through Dec 2027.' },
          ],
          status: 'FLAGGED',
        },
      ]);

      // 6. Audit Logs
      await client.from('audit_logs').upsert([
        {
          id: 'a0000001-0000-0000-0000-000000000001',
          application_id: 'APP-8291',
          actor_id: 'usr-2',
          actor_name: 'Sunita Rao',
          action: 'APPLICATION_CREATED',
          metadata: { borrowerName: 'Rahul Sharma', loanAmount: 2500000 },
        },
      ]);

      console.log('✅ Supabase database seed completed successfully.');
    } catch (seedErr: any) {
      console.warn('Error seeding Supabase database:', seedErr.message);
    }
  },

  async getApplications(): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client
      .from('loan_applications')
      .select(`
        *,
        borrowers (
          id,
          name,
          date_of_birth,
          phone,
          email,
          employment_type,
          employer,
          years_employed
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch applications error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      borrowerId: row.borrower_id,
      borrowerName: row.borrowers?.name || 'Unknown Borrower',
      borrowerEmail: row.borrowers?.email || '',
      borrowerPhone: row.borrowers?.phone || '',
      employmentType: row.borrowers?.employment_type || '',
      loanAmount: Number(row.loan_amount),
      loanPurpose: row.loan_purpose,
      loanTenure: row.loan_tenure,
      interestRate: Number(row.interest_rate),
      creditScore: row.credit_score,
      overallRisk: row.overall_risk,
      status: row.status,
      assignedOfficer: row.assigned_officer,
      collateralValue: Number(row.collateral_value || 0),
      monthlyIncome: Number(row.monthly_income),
      monthlyDebt: Number(row.monthly_debt),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async getApplication(id: string): Promise<any | null> {
    const client = getSupabase();
    if (!client) return null;

    const { data: appRow, error: appError } = await client
      .from('loan_applications')
      .select(`
        *,
        borrowers (*)
      `)
      .eq('id', id)
      .single();

    if (appError || !appRow) return null;

    const [docsRes, findingsRes, memoRes] = await Promise.all([
      client.from('documents').select('*').eq('application_id', id),
      client.from('underwriting_findings').select('*').eq('application_id', id),
      client.from('credit_memos').select('*').eq('application_id', id).single(),
    ]);

    const borrower: Borrower = {
      id: appRow.borrowers.id,
      name: appRow.borrowers.name,
      dateOfBirth: appRow.borrowers.date_of_birth,
      phone: appRow.borrowers.phone,
      email: appRow.borrowers.email,
      employmentType: appRow.borrowers.employment_type,
      employer: appRow.borrowers.employer,
      yearsEmployed: Number(appRow.borrowers.years_employed),
      createdAt: appRow.borrowers.created_at,
    };

    const application: LoanApplication = {
      id: appRow.id,
      borrowerId: appRow.borrower_id,
      loanAmount: Number(appRow.loan_amount),
      loanPurpose: appRow.loan_purpose,
      loanTenure: appRow.loan_tenure,
      interestRate: Number(appRow.interest_rate),
      creditScore: appRow.credit_score,
      overallRisk: appRow.overall_risk,
      status: appRow.status,
      assignedOfficer: appRow.assigned_officer,
      collateralValue: Number(appRow.collateral_value || 0),
      monthlyIncome: Number(appRow.monthly_income),
      monthlyDebt: Number(appRow.monthly_debt),
      createdAt: appRow.created_at,
      updatedAt: appRow.updated_at,
    };

    const documents: DocumentRecord[] = (docsRes.data || []).map((d: any) => ({
      id: d.id,
      applicationId: d.application_id,
      documentType: d.document_type,
      fileName: d.file_name,
      storagePath: d.storage_path,
      fileSizeBytes: Number(d.file_size_bytes || 0),
      processingStatus: d.processing_status,
      extractedSnippet: d.extracted_snippet,
      createdAt: d.created_at,
    }));

    const findings: UnderwritingFinding[] = (findingsRes.data || []).map((f: any) => ({
      id: f.id,
      applicationId: f.application_id,
      severity: f.severity,
      title: f.title,
      explanation: f.explanation,
      observations: f.observations || [],
      evidence: f.evidence || [],
      recommendedReview: f.recommended_review,
      status: f.status,
      reviewerNotes: f.reviewer_notes,
      createdAt: f.created_at,
    }));

    const memo: CreditMemo | null = memoRes.data
      ? {
          id: memoRes.data.id,
          applicationId: memoRes.data.application_id,
          content: memoRes.data.content,
          version: memoRes.data.version,
          generatedBy: memoRes.data.generated_by,
          decision: memoRes.data.decision,
          decisionNotes: memoRes.data.decision_notes,
          reviewedBy: memoRes.data.reviewed_by,
          reviewedAt: memoRes.data.reviewed_at,
          createdAt: memoRes.data.created_at,
          updatedAt: memoRes.data.updated_at,
        }
      : null;

    return { application, borrower, documents, findings, memo };
  },

  async createApplication(data: {
    borrower: Omit<Borrower, 'id' | 'createdAt'>;
    application: Omit<LoanApplication, 'id' | 'borrowerId' | 'overallRisk' | 'status' | 'createdAt' | 'updatedAt'>;
    initialDocuments?: Array<{ documentType: string; fileName: string; snippet?: string }>;
  }): Promise<{ application: LoanApplication; borrower: Borrower } | null> {
    const client = getSupabase();
    if (!client) return null;

    // 1. Insert borrower
    const { data: borRow, error: borError } = await client
      .from('borrowers')
      .insert({
        name: data.borrower.name,
        date_of_birth: data.borrower.dateOfBirth,
        phone: data.borrower.phone,
        email: data.borrower.email,
        employment_type: data.borrower.employmentType,
        employer: data.borrower.employer,
        years_employed: data.borrower.yearsEmployed,
      })
      .select()
      .single();

    if (borError || !borRow) {
      console.warn('Error inserting borrower to Supabase:', borError?.message);
      return null;
    }

    const appId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Insert application
    const { data: appRow, error: appError } = await client
      .from('loan_applications')
      .insert({
        id: appId,
        borrower_id: borRow.id,
        loan_amount: data.application.loanAmount,
        loan_purpose: data.application.loanPurpose,
        loan_tenure: data.application.loanTenure,
        interest_rate: data.application.interestRate,
        credit_score: data.application.creditScore,
        overall_risk: 'PENDING',
        status: 'UNDER_REVIEW',
        assigned_officer: data.application.assignedOfficer || 'Arjun Kapoor',
        collateral_value: data.application.collateralValue || 0,
        monthly_income: data.application.monthlyIncome,
        monthly_debt: data.application.monthlyDebt,
      })
      .select()
      .single();

    if (appError || !appRow) {
      console.warn('Error inserting application to Supabase:', appError?.message);
      return null;
    }

    // 3. Insert documents
    if (data.initialDocuments && data.initialDocuments.length > 0) {
      const docPayloads = data.initialDocuments.map((doc, idx) => ({
        application_id: appId,
        document_type: doc.documentType,
        file_name: doc.fileName,
        storage_path: `${LOAN_DOCUMENTS_BUCKET}/${appId}/${doc.fileName}`,
        file_size_bytes: 1024 * 1024 * (1 + idx),
        processing_status: 'PROCESSED',
        extracted_snippet: doc.snippet || `Verified ${doc.documentType} uploaded for underwriting.`,
      }));
      await client.from('documents').insert(docPayloads);
    }

    // 4. Insert audit log
    await client.from('audit_logs').insert({
      application_id: appId,
      actor_id: 'usr-1',
      actor_name: 'Loan Officer',
      action: 'APPLICATION_CREATED',
      metadata: { loanAmount: data.application.loanAmount, borrower: data.borrower.name },
    });

    const borrower: Borrower = {
      id: borRow.id,
      name: borRow.name,
      dateOfBirth: borRow.date_of_birth,
      phone: borRow.phone,
      email: borRow.email,
      employmentType: borRow.employment_type,
      employer: borRow.employer,
      yearsEmployed: Number(borRow.years_employed),
      createdAt: borRow.created_at,
    };

    const application: LoanApplication = {
      id: appRow.id,
      borrowerId: appRow.borrower_id,
      loanAmount: Number(appRow.loan_amount),
      loanPurpose: appRow.loan_purpose,
      loanTenure: appRow.loan_tenure,
      interestRate: Number(appRow.interest_rate),
      creditScore: appRow.credit_score,
      overallRisk: appRow.overall_risk,
      status: appRow.status,
      assignedOfficer: appRow.assigned_officer,
      collateralValue: Number(appRow.collateral_value || 0),
      monthlyIncome: Number(appRow.monthly_income),
      monthlyDebt: Number(appRow.monthly_debt),
      createdAt: appRow.created_at,
      updatedAt: appRow.updated_at,
    };

    return { application, borrower };
  },

  async updateApplication(id: string, updates: Partial<LoanApplication>): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.status) payload.status = updates.status;
    if (updates.overallRisk) payload.overall_risk = updates.overallRisk;
    if (updates.assignedOfficer) payload.assigned_officer = updates.assignedOfficer;

    await client.from('loan_applications').update(payload).eq('id', id);
  },

  async addDocument(appId: string, doc: { documentType: string; fileName: string; snippet?: string; fileSizeBytes?: number }): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    await client.from('documents').insert({
      application_id: appId,
      document_type: doc.documentType,
      file_name: doc.fileName,
      storage_path: `${LOAN_DOCUMENTS_BUCKET}/${appId}/${doc.fileName}`,
      file_size_bytes: doc.fileSizeBytes || 1200000,
      processing_status: 'PROCESSED',
      extracted_snippet: doc.snippet || `Extracted details from ${doc.fileName}`,
    });

    await client.from('audit_logs').insert({
      application_id: appId,
      actor_id: 'usr-1',
      actor_name: 'Loan Officer',
      action: 'DOCUMENT_UPLOADED',
      metadata: { documentType: doc.documentType, fileName: doc.fileName },
    });
  },

  async deleteDocument(docId: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;
    await client.from('documents').delete().eq('id', docId);
  },

  async saveFindings(appId: string, findings: UnderwritingFinding[], overallRisk: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    // Delete existing findings for this app and insert fresh AI findings
    await client.from('underwriting_findings').delete().eq('application_id', appId);

    const payloads = findings.map((f) => ({
      application_id: appId,
      severity: f.severity,
      title: f.title,
      explanation: f.explanation,
      observations: f.observations,
      evidence: f.evidence,
      recommended_review: f.recommendedReview,
      status: f.status,
      reviewer_notes: f.reviewerNotes,
    }));

    await client.from('underwriting_findings').insert(payloads);
    await client.from('loan_applications').update({ overall_risk: overallRisk, updated_at: new Date().toISOString() }).eq('id', appId);

    await client.from('audit_logs').insert({
      application_id: appId,
      actor_id: 'usr-1',
      actor_name: 'Underwriting Copilot',
      action: 'AI_ANALYSIS_COMPLETED',
      metadata: { findingsCount: findings.length, overallRisk },
    });
  },

  async updateFindingStatus(findingId: string, status: 'FLAGGED' | 'REVIEWED' | 'DISMISSED', notes?: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    const payload: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (notes !== undefined) payload.reviewer_notes = notes;

    await client.from('underwriting_findings').update(payload).eq('id', findingId);
  },

  async saveCreditMemo(appId: string, content: CreditMemoContent, generatedBy: string, version: number): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    const { data: existing } = await client.from('credit_memos').select('id').eq('application_id', appId).single();

    if (existing) {
      await client.from('credit_memos').update({
        content,
        version,
        generated_by: generatedBy,
        updated_at: new Date().toISOString(),
      }).eq('application_id', appId);
    } else {
      await client.from('credit_memos').insert({
        application_id: appId,
        content,
        version: 1,
        generated_by: generatedBy,
      });
    }

    await client.from('audit_logs').insert({
      application_id: appId,
      actor_id: 'usr-1',
      actor_name: 'Underwriter',
      action: existing ? 'MEMO_EDITED' : 'MEMO_GENERATED',
      metadata: { version, generatedBy },
    });
  },

  async recordHumanDecision(appId: string, decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO', notes: string, reviewerName: string, newStatus: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    await client.from('loan_applications').update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', appId);

    await client.from('credit_memos').update({
      decision,
      decision_notes: notes,
      reviewed_by: reviewerName,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('application_id', appId);

    await client.from('audit_logs').insert({
      application_id: appId,
      actor_id: 'usr-1',
      actor_name: reviewerName,
      action: 'HUMAN_DECISION_RECORDED',
      metadata: { decision, notes, newStatus },
    });
  },

  async addAuditLog(log: AuditLog): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    await client.from('audit_logs').insert({
      application_id: log.applicationId,
      actor_id: log.actorId,
      actor_name: log.actorName,
      action: log.action,
      metadata: log.metadata,
      created_at: log.createdAt,
    });
  },

  async getAuditLogs(applicationId?: string): Promise<AuditLog[]> {
    const client = getSupabase();
    if (!client) return [];

    let query = client.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      applicationId: row.application_id,
      actorId: row.actor_id,
      actorName: row.actor_name,
      action: row.action,
      metadata: row.metadata || {},
      createdAt: row.created_at,
    }));
  },

  async saveMetrics(appId: string, metrics: any): Promise<void> {
    const client = getSupabase();
    if (!client || !metrics) return;

    try {
      await client.from('financial_metrics').delete().eq('application_id', appId);

      const metricRows = [
        {
          application_id: appId,
          metric_name: 'EMI',
          metric_value: metrics.emi.value,
          formula: metrics.emi.formula,
          inputs: metrics.emi.inputs,
        },
        {
          application_id: appId,
          metric_name: 'Proposed DTI',
          metric_value: metrics.proposedDTI.value,
          formula: metrics.proposedDTI.formula,
          inputs: metrics.proposedDTI.inputs,
        },
        {
          application_id: appId,
          metric_name: 'LTV',
          metric_value: metrics.ltv.value,
          formula: metrics.ltv.formula,
          inputs: metrics.ltv.inputs,
        },
        {
          application_id: appId,
          metric_name: 'Free Cash Flow',
          metric_value: metrics.freeCashFlow.value,
          formula: metrics.freeCashFlow.formula,
          inputs: metrics.freeCashFlow.inputs,
        },
        {
          application_id: appId,
          metric_name: 'DSCR',
          metric_value: metrics.dscr.value,
          formula: metrics.dscr.formula,
          inputs: metrics.dscr.inputs,
        },
      ];

      await client.from('financial_metrics').insert(metricRows);
    } catch (err: any) {
      console.warn('Error saving metrics to Supabase:', err.message);
    }
  },

  async savePolicyChecks(appId: string, policies: any[]): Promise<void> {
    const client = getSupabase();
    if (!client || !policies || policies.length === 0) return;

    try {
      await client.from('policy_checks').delete().eq('application_id', appId);

      const policyRows = policies.map((p) => ({
        application_id: appId,
        policy_name: p.policyName,
        result: p.result,
        value: String(p.value),
        threshold: p.threshold,
        explanation: p.explanation,
      }));

      await client.from('policy_checks').insert(policyRows);
    } catch (err: any) {
      console.warn('Error saving policy checks to Supabase:', err.message);
    }
  },

  async getDocuments(appId: string): Promise<DocumentRecord[]> {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client.from('documents').select('*').eq('application_id', appId);
    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      applicationId: d.application_id,
      documentType: d.document_type,
      fileName: d.file_name,
      storagePath: d.storage_path,
      fileSizeBytes: Number(d.file_size_bytes || 0),
      processingStatus: d.processing_status,
      extractedSnippet: d.extracted_snippet,
      createdAt: d.created_at,
    }));
  },

  async getFindings(appId: string): Promise<UnderwritingFinding[]> {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client.from('underwriting_findings').select('*').eq('application_id', appId);
    if (error || !data) return [];

    return data.map((f: any) => ({
      id: f.id,
      applicationId: f.application_id,
      severity: f.severity,
      title: f.title,
      explanation: f.explanation,
      observations: f.observations || [],
      evidence: f.evidence || [],
      recommendedReview: f.recommended_review,
      status: f.status,
      reviewerNotes: f.reviewer_notes,
      createdAt: f.created_at,
    }));
  },

  async getMemo(appId: string): Promise<CreditMemo | null> {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client.from('credit_memos').select('*').eq('application_id', appId).single();
    if (error || !data) return null;

    return {
      id: data.id,
      applicationId: data.application_id,
      content: data.content,
      version: data.version,
      generatedBy: data.generated_by,
      decision: data.decision,
      decisionNotes: data.decision_notes,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
};
