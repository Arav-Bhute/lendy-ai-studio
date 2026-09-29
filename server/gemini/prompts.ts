/**
 * Dedicated prompt templates for Gemini Underwriting Copilot
 *
 * Principles:
 * 1. Do NOT invent facts.
 * 2. Do NOT invent evidence or fake document page numbers.
 * 3. Clearly separate observed facts from interpretation.
 * 4. Use deterministic calculations provided by the backend engine as ground truth.
 * 5. State uncertainty where evidence is incomplete or missing.
 * 6. Always recommend human review.
 * 7. Never make the final autonomous lending decision.
 */

export const UNDERWRITING_SYSTEM_INSTRUCTION = `You are Lendy Underwriting Copilot, an expert AI credit risk analyst and assistant for bank loan officers and underwriters.
Your role is to assist human underwriters by analyzing loan applications, verified document excerpts, deterministic financial calculations, and institutional policy rules.

CRITICAL OPERATIONAL RULES:
- You are an advisory copilot, NOT an autonomous decision maker. The final lending decision ALWAYS remains with an authorized human reviewer.
- Do NOT perform arithmetic calculations; use the exact deterministic numbers provided to you.
- Do NOT invent document names, facts, numbers, or page numbers.
- If information is missing, explicitly list it in 'missingInformation'.
- Do NOT make unsupported fraud accusations. Use neutral, objective, audit-grade language (e.g., "Potential inconsistency requiring loan officer verification").
- Return strictly valid JSON conforming exactly to the requested schema.`;

export function buildUnderwritingPrompt(appData: {
  borrower: {
    name: string;
    dob: string;
    employmentType: string;
    employer: string;
    yearsEmployed: number;
  };
  loan: {
    id: string;
    amount: number;
    purpose: string;
    tenureMonths: number;
    interestRate: number;
    creditScore: number;
  };
  metrics: {
    monthlyIncome: number;
    monthlyDebt: number;
    newLoanEMI: number;
    existingDTI: string;
    proposedDTI: string;
    ltv: string;
    freeCashFlow: string;
    dscr: string;
  };
  policies: Array<{
    policyName: string;
    result: string;
    threshold: string;
    explanation: string;
  }>;
  documents: Array<{
    documentType: string;
    fileName: string;
    snippet?: string;
  }>;
}): string {
  return `Analyze this loan underwriting application and provide structured findings.

BORROWER PROFILE:
- Name: ${appData.borrower.name}
- Employment: ${appData.borrower.employmentType} at ${appData.borrower.employer} (${appData.borrower.yearsEmployed} years)
- Credit Score: ${appData.loan.creditScore}

LOAN REQUEST:
- Application ID: ${appData.loan.id}
- Loan Principal: ₹${appData.loan.amount.toLocaleString('en-IN')}
- Purpose: ${appData.loan.purpose}
- Tenure: ${appData.loan.tenureMonths} months
- Interest Rate: ${appData.loan.interestRate}% p.a.

DETERMINISTIC FINANCIAL ENGINE RESULTS:
- Gross Monthly Income: ₹${appData.metrics.monthlyIncome.toLocaleString('en-IN')}
- Existing Monthly Debt: ₹${appData.metrics.monthlyDebt.toLocaleString('en-IN')}
- New Loan Monthly EMI: ₹${appData.metrics.newLoanEMI.toLocaleString('en-IN')}
- Existing DTI: ${appData.metrics.existingDTI}
- Proposed Total DTI: ${appData.metrics.proposedDTI}
- Collateral LTV: ${appData.metrics.ltv}
- Estimated Net Free Cash Flow: ${appData.metrics.freeCashFlow}
- Debt Service Coverage (DSCR): ${appData.metrics.dscr}

INSTITUTIONAL POLICY ENGINE EVALUATION:
${appData.policies.map(p => `- [${p.result}] ${p.policyName}: Threshold (${p.threshold}) -> ${p.explanation}`).join('\n')}

VERIFIED EVIDENCE DOCUMENTS ON FILE:
${appData.documents.map((d, i) => `- Doc ${i + 1}: [${d.documentType}] "${d.fileName}" — Excerpt: ${d.snippet || 'Uploaded in vault'}`).join('\n')}

INSTRUCTIONS:
Return a JSON object with this exact shape:
{
  "overallRisk": "LOW" | "MEDIUM" | "HIGH",
  "summary": "2-3 sentence executive synthesis of the borrower risk and capacity",
  "findings": [
    {
      "severity": "HIGH" | "MEDIUM" | "LOW" | "POSITIVE",
      "title": "Concise headline describing the observation",
      "explanation": "Detailed professional reasoning connecting observed facts and financial metrics",
      "observations": [
        {
          "metric": "Name of metric or fact",
          "value": "Value with unit",
          "source": "Document name or Financial Engine",
          "page": 1
        }
      ],
      "evidence": [
        {
          "documentName": "Exact document name from list above",
          "page": 1,
          "quoteOrMetric": "Verified fact or excerpt from the document"
        }
      ],
      "recommendedReview": "Specific action item for the loan officer"
    }
  ],
  "missingInformation": ["List of any missing documents or missing income declarations"],
  "inconsistencies": ["Any discrepancies identified across documents or declarations"],
  "positiveSignals": ["Key credit strengths backing the borrower's repayment ability"],
  "policyConcerns": ["Specific policy triggers requiring officer exception approvals"]
}
`;
}

export function buildMemoPrompt(appData: {
  borrowerName: string;
  loanId: string;
  loanAmount: number;
  loanPurpose: string;
  tenureMonths: number;
  interestRate: number;
  creditScore: number;
  metricsSummary: string;
  findingsSummary: string;
  policiesSummary: string;
  documentsSummary: string;
}): string {
  return `Draft an enterprise-grade Credit Memo for loan application ${appData.loanId}.

APPLICATION SUMMARY:
- Borrower: ${appData.borrowerName}
- Loan Amount: ₹${appData.loanAmount.toLocaleString('en-IN')}
- Purpose: ${appData.loanPurpose}
- Tenure: ${appData.tenureMonths} months @ ${appData.interestRate}%
- Credit Bureau Score: ${appData.creditScore}

FINANCIAL ENGINE & METRICS:
${appData.metricsSummary}

AI FINDINGS & EVIDENCE:
${appData.findingsSummary}

POLICY CHECKS:
${appData.policiesSummary}

VERIFIED DOCUMENTS:
${appData.documentsSummary}

INSTRUCTIONS:
Draft a complete, objective, and auditable credit memo.
Return a JSON object conforming to:
{
  "executiveSummary": "Concise underwriting overview with recommendation for human sign-off",
  "borrowerProfile": "Detailed synthesis of employment, background, and stability",
  "loanRequest": "Details on loan amount, tenure, pricing, and stated purpose",
  "financialAnalysis": "Rigorous examination of income, obligations, and debt coverage",
  "repaymentCapacity": "Assessment of cash flow cushion, volatility, and stress tolerance",
  "riskFactors": ["Key risk item 1", "Key risk item 2"],
  "positiveFactors": ["Key strength 1", "Key strength 2"],
  "policyChecksSummary": "Summary of policy rule evaluations and required exceptions",
  "missingInformation": ["Any pending items or follow-ups"],
  "questionsForLoanOfficer": ["Specific investigative questions for borrower interview"],
  "supportingEvidence": [
    {
      "document": "Document Name",
      "page": 1,
      "fact": "Verified supporting fact"
    }
  ]
}
`;
}
