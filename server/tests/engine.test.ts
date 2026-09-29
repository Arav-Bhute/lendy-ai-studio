import {
  calculateEMI,
  calculateDTI,
  calculateLTV,
  calculateFreeCashFlow,
  calculateDSCR,
} from '../calculations/financialEngine.js';
import { evaluatePolicies } from '../policies/policyEngine.js';

function runTests() {
  console.log('--- RUNNING LENDY FINANCIAL ENGINE & POLICY TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. EMI Test: ₹25,00,000 at 9.5% for 60 months
  const emi = calculateEMI(2500000, 9.5, 60);
  assert(emi.value > 52000 && emi.value < 53000, `EMI calculated correctly: ${emi.formatted}`);
  assert(emi.formula.includes('EMI = P × r'), 'EMI formula properly documented');

  // 2. DTI Test: Monthly debt ₹28,000, new EMI ₹52,492, monthly income ₹1,45,000
  const dti = calculateDTI(28000, emi.value, 145000);
  assert(dti.proposedDTI.value > 0.50 && dti.proposedDTI.value < 0.60, `Proposed DTI: ${dti.proposedDTI.formatted}`);

  // 3. LTV Test: Loan ₹25,00,000 against collateral ₹38,00,000
  const ltv = calculateLTV(2500000, 3800000);
  assert(ltv.value > 0.64 && ltv.value < 0.67, `LTV calculated: ${ltv.formatted}`);

  // 4. Free Cash Flow Test
  const fcf = calculateFreeCashFlow(145000, 36250, 28000 + emi.value);
  assert(fcf.value > 0, `FCF is positive: ${fcf.formatted}`);

  // 5. Policy Engine Test: Passing score 742, high DTI (65%), low score (580)
  const passPolicies = evaluatePolicies({
    creditScore: 742,
    proposedDTI: 0.45,
    ltv: 0.65,
    uploadedDocumentTypes: ['Bank Statement', 'Income Statement', 'Identity Document'],
    monthlyIncome: 145000,
    yearsEmployed: 4.5,
  });
  const creditCheck = passPolicies.find(p => p.policyName === 'Credit Score Floor');
  assert(creditCheck?.result === 'PASS', 'Credit Score Floor PASS for 742');

  const failPolicies = evaluatePolicies({
    creditScore: 580,
    proposedDTI: 0.72,
    ltv: 0.90,
    uploadedDocumentTypes: [],
    monthlyIncome: 50000,
    yearsEmployed: 0.5,
  });
  const creditFail = failPolicies.find(p => p.policyName === 'Credit Score Floor');
  const dtiFail = failPolicies.find(p => p.policyName === 'Maximum Proposed DTI');
  const docFail = failPolicies.find(p => p.policyName === 'Mandatory Compliance Documents');

  assert(creditFail?.result === 'FAIL', 'Credit Score Floor FAIL for 580');
  assert(dtiFail?.result === 'FAIL', 'DTI rule FAIL for 72% DTI');
  assert(docFail?.result === 'REVIEW', 'Missing documents flagged for REVIEW');

  console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
