import type {
  LoanApplication,
  ApplicationWorkspaceData,
  DocumentRecord,
  UnderwritingFinding,
  CreditMemo,
  CreditMemoContent,
  AuditLog,
  DecisionType,
} from '../types';
import { getSupabase, initSupabase } from '../lib/supabase';

async function getAuthHeader(): Promise<string | null> {
  try {
    const client = getSupabase() || (await initSupabase());
    if (client) {
      const { data } = await client.auth.getSession();
      if (data?.session?.access_token) {
        return `Bearer ${data.session.access_token}`;
      }
    }
  } catch (err) {
    // ignore
  }

  const demoToken = localStorage.getItem('lendy_demo_token');
  if (demoToken) {
    return `Bearer ${demoToken}`;
  }

  return null;
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (!headers['Authorization']) {
    const authHeader = await getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const body = await res.json();
  if (!res.ok || body.success === false) {
    const errorMsg = body?.error?.message || `HTTP error ${res.status}`;
    throw new Error(errorMsg);
  }

  return body.data;
}

export const api = {
  // Applications
  getApplications: () => fetchJSON<LoanApplication[]>('/api/applications'),
  getApplication: (id: string) => fetchJSON<ApplicationWorkspaceData>(`/api/applications/${id}`),
  createApplication: (payload: {
    borrower: Record<string, any>;
    application: Record<string, any>;
    documents?: Array<{ documentType: string; fileName: string; snippet?: string }>;
  }) => fetchJSON<{ application: LoanApplication }>('/api/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateApplication: (id: string, updates: Partial<LoanApplication>) =>
    fetchJSON<LoanApplication>(`/api/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Documents
  getDocuments: (appId: string) => fetchJSON<DocumentRecord[]>(`/api/applications/${appId}/documents`),
  uploadDocument: (appId: string, data: { documentType: string; fileName: string; snippet?: string; fileSizeBytes?: number }) =>
    fetchJSON<DocumentRecord>(`/api/applications/${appId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteDocument: (docId: string) =>
    fetchJSON<{ id: string; deleted: boolean }>(`/api/documents/${docId}`, {
      method: 'DELETE',
    }),

  // Underwriting AI Analysis
  runAIAnalysis: (appId: string) =>
    fetchJSON<{
      overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
      summary: string;
      findings: UnderwritingFinding[];
      missingInformation: string[];
      inconsistencies: string[];
      positiveSignals: string[];
      policyConcerns: string[];
      updatedMetrics: any;
      updatedPolicies: any;
    }>(`/api/applications/${appId}/analyze`, {
      method: 'POST',
    }),

  updateFindingStatus: (
    appId: string,
    findingId: string,
    status: 'FLAGGED' | 'REVIEWED' | 'DISMISSED',
    reviewerNotes?: string
  ) =>
    fetchJSON<UnderwritingFinding>(`/api/applications/${appId}/findings/${findingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewerNotes }),
    }),

  // Credit Memo
  getMemo: (appId: string) => fetchJSON<CreditMemo | null>(`/api/applications/${appId}/memo`),
  generateMemo: (appId: string) =>
    fetchJSON<CreditMemo>(`/api/applications/${appId}/memo/generate`, {
      method: 'POST',
    }),
  updateMemo: (appId: string, content: CreditMemoContent) =>
    fetchJSON<CreditMemo>(`/api/applications/${appId}/memo`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),

  // Human Review & Sign-Off
  submitReview: (appId: string, payload: { decision: DecisionType; notes: string; reviewerName?: string }) =>
    fetchJSON<{ application: LoanApplication; memo?: CreditMemo }>(`/api/applications/${appId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Activity / Audit Logs
  getApplicationActivity: (appId: string) => fetchJSON<AuditLog[]>(`/api/applications/${appId}/activity`),
  getAllActivity: () => fetchJSON<AuditLog[]>('/api/activity'),
};
