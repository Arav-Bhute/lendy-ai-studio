export interface PolicyCheckResult {
  policyName: string;
  result: 'PASS' | 'REVIEW' | 'FAIL';
  value: string | number;
  threshold: string;
  explanation: string;
}

export interface PolicyEvaluationInput {
  creditScore: number;
  proposedDTI: number; // as ratio e.g. 0.42
  ltv: number; // as ratio e.g. 0.75
  uploadedDocumentTypes: string[];
  monthlyIncome: number;
  yearsEmployed: number;
}

/**
 * Deterministic Policy Engine
 * Note: These thresholds represent configurable institutional demonstration policy rules.
 */
export function evaluatePolicies(input: PolicyEvaluationInput): PolicyCheckResult[] {
  const checks: PolicyCheckResult[] = [];

  // Policy 1: Credit Score Threshold
  if (input.creditScore < 600) {
    checks.push({
      policyName: 'Credit Score Floor',
      result: 'FAIL',
      value: input.creditScore,
      threshold: '≥ 600 min (≥ 650 preferred)',
      explanation: `Credit bureau score of ${input.creditScore} is below minimum underwriting threshold (600), triggering High Risk review.`,
    });
  } else if (input.creditScore < 650) {
    checks.push({
      policyName: 'Credit Score Floor',
      result: 'REVIEW',
      value: input.creditScore,
      threshold: '≥ 650 preferred',
      explanation: `Credit score of ${input.creditScore} falls into the 600-649 conditional review zone. Additional guarantor or verification required.`,
    });
  } else {
    checks.push({
      policyName: 'Credit Score Floor',
      result: 'PASS',
      value: input.creditScore,
      threshold: '≥ 650 preferred',
      explanation: `Credit score of ${input.creditScore} satisfies prime lending credit profile standards.`,
    });
  }

  // Policy 2: Debt-to-Income (DTI) Ceiling
  const proposedDtiPct = Number((input.proposedDTI * 100).toFixed(1));
  if (input.proposedDTI > 0.60) {
    checks.push({
      policyName: 'Maximum Proposed DTI',
      result: 'FAIL',
      value: `${proposedDtiPct}%`,
      threshold: '≤ 50% max (≤ 60% hard ceiling)',
      explanation: `Proposed total DTI of ${proposedDtiPct}% exceeds maximum institutional risk ceiling of 60%. Severe debt burden.`,
    });
  } else if (input.proposedDTI > 0.50) {
    checks.push({
      policyName: 'Maximum Proposed DTI',
      result: 'REVIEW',
      value: `${proposedDtiPct}%`,
      threshold: '≤ 50%',
      explanation: `Proposed DTI of ${proposedDtiPct}% exceeds standard 50% recommendation. Requires secondary debt assessment or income verification.`,
    });
  } else {
    checks.push({
      policyName: 'Maximum Proposed DTI',
      result: 'PASS',
      value: `${proposedDtiPct}%`,
      threshold: '≤ 50%',
      explanation: `Proposed total DTI of ${proposedDtiPct}% is within safe lending guidelines, preserving discretionary income.`,
    });
  }

  // Policy 3: Loan-to-Value (LTV) Exposure
  const ltvPct = Number((input.ltv * 100).toFixed(1));
  if (input.ltv > 0.85) {
    checks.push({
      policyName: 'Collateral LTV Threshold',
      result: 'REVIEW',
      value: `${ltvPct}%`,
      threshold: '≤ 80% prime (≤ 85% with mortgage insurance)',
      explanation: `LTV ratio of ${ltvPct}% exceeds conventional 80% coverage threshold. Collateral cushion is reduced.`,
    });
  } else {
    checks.push({
      policyName: 'Collateral LTV Threshold',
      result: 'PASS',
      value: `${ltvPct}%`,
      threshold: '≤ 80%',
      explanation: `Collateral coverage is adequate with LTV at ${ltvPct}%, providing satisfactory loss cushion.`,
    });
  }

  // Policy 4: Mandatory Document Verification
  const mandatoryDocs = ['Bank Statement', 'Income Statement', 'Identity Document'];
  const missingMandatory = mandatoryDocs.filter(
    (m) => !input.uploadedDocumentTypes.some((d) => d.toLowerCase().includes(m.toLowerCase().split(' ')[0]))
  );

  if (missingMandatory.length > 0) {
    checks.push({
      policyName: 'Mandatory Compliance Documents',
      result: 'REVIEW',
      value: `Missing: ${missingMandatory.join(', ')}`,
      threshold: 'Bank Statement, Income/Salary Slip, Photo ID',
      explanation: `Required verification documents (${missingMandatory.join(', ')}) have not been uploaded or processed.`,
    });
  } else {
    checks.push({
      policyName: 'Mandatory Compliance Documents',
      result: 'PASS',
      value: 'All Mandatory Uploaded',
      threshold: 'Bank Statement, Income/Salary Slip, Photo ID',
      explanation: 'All foundational compliance and income verification documents are present in application file.',
    });
  }

  // Policy 5: Employment Stability Rule
  if (input.yearsEmployed < 1.0) {
    checks.push({
      policyName: 'Employment Stability',
      result: 'REVIEW',
      value: `${input.yearsEmployed} yrs`,
      threshold: '≥ 1.0 year at current employer',
      explanation: `Borrower has been with current employer for less than 12 months (${input.yearsEmployed} years), requiring confirmation of continuous work history.`,
    });
  } else {
    checks.push({
      policyName: 'Employment Stability',
      result: 'PASS',
      value: `${input.yearsEmployed} yrs`,
      threshold: '≥ 1.0 year at current employer',
      explanation: `Borrower demonstrates established tenure of ${input.yearsEmployed} years at current employer.`,
    });
  }

  return checks;
}
