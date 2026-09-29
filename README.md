# Lendy — AI Loan Underwriting Copilot

An enterprise-grade, explainable, evidence-backed AI loan underwriting copilot for loan officers, credit analysts, underwriters, and risk committees.

---

## 1. Problem

Commercial and retail loan underwriting is fundamentally bottlenecked by manual document synthesis:
* Loan officers spend hours manually cross-referencing multi-page bank statements, salary slips, tax returns, and credit bureau scores.
* Black-box AI systems are unacceptable in credit underwriting because regulatory and risk teams require clear explanations, mathematical reproducibility, and strict audit trails.
* Autonomous AI decisioning introduces compliance and hallucination risk if the model acts as the sole approver.

## 2. Solution

**Lendy is an AI Copilot, NOT an autonomous decision maker.**

* **Deterministic Financial Engine**: Computes exact values for Equated Monthly Installments (EMI), Debt-to-Income (DTI), Loan-to-Value (LTV), Free Cash Flow (FCF), and Debt Service Coverage (DSCR) using pure mathematical formulas in Node.js. Gemini is **never** asked to perform arithmetic.
* **Explainable AI Reasoning (Gemini 3.8 Flash)**: Synthesizes deterministic financial ratios, document extracts, and institutional policy rules to surface high-risk flags, inconsistencies, and positive credit signals.
* **Signature "Why?" Evidence Drawer**: Every AI observation links directly to its source document, specific page number, and mathematical formula.
* **Audit-Ready Credit Memos**: Generates structured, editable credit memorandums with an integrated human sign-off station for authorized review.

---

## 3. Core Features

* **Enterprise Underwriting Dashboard**: Real-time KPI portfolio metrics, Recharts risk distribution and exposure charts, recent applications pipeline, and live audit event streams.
* **Applications Pipeline**: High-density, filterable data grid with multi-status tabs (All, Under Review, Pending Documents, High Risk, Completed).
* **New Application Wizard**: 5-step structured intake (Borrower Profile → Loan Parameters → Financial Disclosures → Verification Documents → Review & Creation).
* **Underwriting Workspace**: The primary operational workstation featuring borrower profiles, verified financial snapshot cards, deterministic formula inspection, AI risk findings, institutional policy checklists, and evidence document vault.
* **Evidence Drawer ("Why?" Feature)**: Transparent inspector detailing flagged observations, observed facts, calculated numbers, Gemini reasoning, document and page citations, and loan officer review notes.
* **Institutional Policy Engine**: Deterministic compliance rules (Credit Score Floor, Maximum DTI Ceiling, Collateral LTV Cushion, Mandatory KYC/Income Documents).
* **Credit Memo Generator & Human Sign-Off**: Comprehensive 11-section institutional memorandum with inline section editing, regeneration, clipboard export, and final human decision recording (`APPROVE`, `REJECT`, `REQUEST_INFO`).
* **Compliance Audit Trail**: Chronological event logging across every action in the loan lifecycle.

---

## 4. Architecture

```
React (Vite SPA + Tailwind CSS + Recharts)
              │
              ▼  (HTTP / JSON API)
Express REST Server (Node.js + TypeScript)
              │
              ├───► Deterministic Financial Engine (Pure math: EMI, DTI, LTV, FCF)
              │
              ├───► Deterministic Policy Engine (Configurable threshold rules)
              │
              ├───► Google Gemini API (gemini-3.8-flash: document & risk interpretation)
              │
              └───► Supabase PostgreSQL Schema & In-Memory Data Store (ACID / Audit parity)
```

---

## 5. Technology Stack

* **Frontend**: React 19, TypeScript, Vite, React Router, Tailwind CSS, Lucide React, Recharts.
* **Backend**: Node.js, Express.js, TypeScript (`tsx`).
* **Database**: Supabase PostgreSQL (`schema.sql` and `seed.sql` provided) with in-memory persistence layer.
* **AI Model**: Google Gemini API (`gemini-3.8-flash`) via the modern `@google/genai` TypeScript SDK.

---

## 6. AI Architecture & Prompt Design

Gemini is strictly leveraged for linguistic comprehension, multi-document cross-referencing, and credit memo drafting.

* **Server-Side Only**: The Gemini API key exists exclusively on the backend server (`GEMINI_API_KEY`).
* **Prompt Isolation**: Prompts (`server/gemini/prompts.ts`) explicitly forbid autonomous decisions, arithmetic calculation, and fake citations.
* **Resilient Parsing**: Validates strict JSON output; falls back gracefully to deterministic rule-based evaluation if the API key is not supplied or offline.

---

## 7. Database Schema

The database design adheres to the Supabase PostgreSQL specification in `/server/db/schema.sql`:
1. `users` (Loan officers, underwriters, risk admins)
2. `borrowers` (Borrower identity, employment, tenure)
3. `loan_applications` (Financial disclosures, loan terms, credit score, risk, status)
4. `documents` (Evidence files, file sizes, processing status)
5. `extracted_financial_data` (Confidence-scored fact assertions)
6. `financial_metrics` (Deterministic formulas, inputs, outputs)
7. `underwriting_findings` (AI observations with evidence links)
8. `policy_checks` (Rule evaluations and thresholds)
9. `credit_memos` (Structured memorandum drafts, version history, human decisions)
10. `audit_logs` (Immutable event log)

---

## 8. API Endpoints

### Authentication
* `POST /api/auth/login` — Authenticate loan officer profile
* `POST /api/auth/register` — Register underwriter account
* `GET /api/auth/me` — Retrieve active profile

### Applications
* `GET /api/applications` — List all pipeline applications
* `GET /api/applications/:id` — Full application workspace data
* `POST /api/applications` — Create new application with initial documents
* `PATCH /api/applications/:id` — Update status or application parameters

### Underwriting & AI Analysis
* `POST /api/applications/:id/analyze` — Trigger AI Underwriting Analysis
* `GET /api/applications/:id/findings` — Retrieve flagged risk findings
* `GET /api/applications/:id/metrics` — Retrieve deterministic metrics
* `GET /api/applications/:id/policies` — Retrieve policy evaluations
* `PATCH /api/applications/:id/findings/:findingId` — Review & mark finding

### Credit Memo & Decisioning
* `POST /api/applications/:id/memo/generate` — Generate / regenerate memo
* `GET /api/applications/:id/memo` — Get active credit memo
* `PATCH /api/applications/:id/memo` — Update / edit memo content
* `POST /api/applications/:id/review` — Record authorized human underwriter decision

### Audit & Activity
* `GET /api/applications/:id/activity` — Get application audit events
* `GET /api/activity` — Full compliance audit log

---

## 9. Setup & Running Locally

### Prerequisites
* Node.js (v18+)
* npm

### Environment Variables
Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### Installation
```bash
npm install
```

### Run Full-Stack Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Financial Engine Test Suite
```bash
npx tsx server/tests/engine.test.ts
```

---

## 10. Complete Demonstration Flow (Definition of Done)

1. Open **Lendy** at [http://localhost:3000](http://localhost:3000).
2. Browse the **Overview Dashboard** (KPIs, Risk Distribution Chart, Requested Principal Chart).
3. Navigate to **Borrower Applications** and select **Rahul Sharma (`APP-8291`)**.
4. Review the **Borrower Overview** and **Deterministic Financial Snapshot** (EMI, DTI, LTV, FCF).
5. Click **"Run AI Analysis"** (or **"Re-Run AI Analysis"**).
6. Observe the animated multi-step progress state as Gemini synthesizes the underwriting case.
7. Inspect the generated **Risk Findings** and **Positive Signals**.
8. Click **"Why?"** on any finding to open the **Evidence Drawer**.
9. Review observed facts, AI reasoning, verified document quotes, and page numbers.
10. Add an underwriter note and click **"Mark Reviewed"**. Close the drawer.
11. Click **"Generate / View Credit Memo"** at the bottom.
12. Review the structured 11-section memo, click **"Edit Memo"**, make a change, and click **"Save Edits"**.
13. Scroll down to the **Human Underwriter Final Review Station**.
14. Enter reviewer notes and click **"Approve Loan Facility"** (or **"Reject"** / **"Request More Info"**).
15. Navigate to **Compliance Audit Trail** in the sidebar to verify the decision was logged immutably.
