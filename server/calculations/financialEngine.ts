export interface CalculationResult {
  value: number;
  formatted: string;
  formula: string;
  inputs: Record<string, number | string>;
  explanation: string;
}

/**
 * Deterministic Financial Engine
 * Pure mathematical functions for loan underwriting calculations.
 * Gemini is NEVER used as the source of truth for arithmetic.
 */

/**
 * Equated Monthly Installment (EMI)
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * P = Principal loan amount
 * r = Monthly interest rate (annual % / 12 / 100)
 * n = Tenure in months
 */
export function calculateEMI(
  principal: number,
  annualInterestRatePercent: number,
  tenureMonths: number
): CalculationResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      value: 0,
      formatted: '₹0',
      formula: 'EMI = P × r × (1+r)^n / ((1+r)^n - 1)',
      inputs: { principal, annualInterestRatePercent, tenureMonths },
      explanation: 'Loan principal or tenure must be greater than zero.',
    };
  }

  const monthlyRate = annualInterestRatePercent / 12 / 100;

  if (monthlyRate === 0) {
    const value = Math.round(principal / tenureMonths);
    return {
      value,
      formatted: `₹${value.toLocaleString('en-IN')}`,
      formula: 'EMI = P / n (0% interest)',
      inputs: { principal, annualInterestRatePercent, tenureMonths },
      explanation: `Zero-interest amortization of ₹${principal.toLocaleString('en-IN')} over ${tenureMonths} months.`,
    };
  }

  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  const emi = Math.round(numerator / denominator);

  return {
    value: emi,
    formatted: `₹${emi.toLocaleString('en-IN')}`,
    formula: 'EMI = P × r × (1+r)^n / ((1+r)^n - 1)',
    inputs: {
      principal,
      annualInterestRatePercent,
      tenureMonths,
      monthlyRatePercent: Number((monthlyRate * 100).toFixed(4)),
    },
    explanation: `Monthly repayment obligation of ₹${emi.toLocaleString('en-IN')} computed on principal of ₹${principal.toLocaleString('en-IN')} at ${annualInterestRatePercent}% per annum over ${tenureMonths} months (${(tenureMonths / 12).toFixed(1)} years).`,
  };
}

/**
 * Debt-to-Income (DTI)
 * Formula: DTI = Total Monthly Debt Obligations / Gross Monthly Income
 */
export function calculateDTI(
  existingMonthlyDebt: number,
  newLoanEMI: number,
  grossMonthlyIncome: number
): {
  existingDTI: CalculationResult;
  proposedDTI: CalculationResult;
} {
  const existingRatio = grossMonthlyIncome > 0 ? (existingMonthlyDebt / grossMonthlyIncome) : 0;
  const totalDebt = existingMonthlyDebt + newLoanEMI;
  const proposedRatio = grossMonthlyIncome > 0 ? (totalDebt / grossMonthlyIncome) : 0;

  return {
    existingDTI: {
      value: Number(existingRatio.toFixed(4)),
      formatted: `${(existingRatio * 100).toFixed(1)}%`,
      formula: 'DTI = Existing Monthly Debt / Gross Monthly Income',
      inputs: { existingMonthlyDebt, grossMonthlyIncome },
      explanation: `Existing monthly debt of ₹${existingMonthlyDebt.toLocaleString('en-IN')} consumes ${(existingRatio * 100).toFixed(1)}% of gross monthly income (₹${grossMonthlyIncome.toLocaleString('en-IN')}).`,
    },
    proposedDTI: {
      value: Number(proposedRatio.toFixed(4)),
      formatted: `${(proposedRatio * 100).toFixed(1)}%`,
      formula: 'Proposed DTI = (Existing Debt + New EMI) / Gross Monthly Income',
      inputs: { existingMonthlyDebt, newLoanEMI, totalDebt, grossMonthlyIncome },
      explanation: `Total monthly debt commitments would reach ₹${totalDebt.toLocaleString('en-IN')}, representing ${(proposedRatio * 100).toFixed(1)}% of monthly income.`,
    },
  };
}

/**
 * Loan-to-Value (LTV)
 * Formula: LTV = Loan Amount / Appraised Asset or Collateral Value
 */
export function calculateLTV(loanAmount: number, collateralOrAssetValue: number): CalculationResult {
  if (collateralOrAssetValue <= 0) {
    return {
      value: 1,
      formatted: '100% (Unsecured)',
      formula: 'LTV = Loan Amount / Asset Value',
      inputs: { loanAmount, collateralOrAssetValue },
      explanation: 'No qualifying collateral or asset registered; loan treated as unsecured.',
    };
  }

  const ratio = loanAmount / collateralOrAssetValue;
  return {
    value: Number(ratio.toFixed(4)),
    formatted: `${(ratio * 100).toFixed(1)}%`,
    formula: 'LTV = Loan Amount / Collateral Value',
    inputs: { loanAmount, collateralOrAssetValue },
    explanation: `Requested loan of ₹${loanAmount.toLocaleString('en-IN')} backed by asset valuation of ₹${collateralOrAssetValue.toLocaleString('en-IN')}, yielding an LTV of ${(ratio * 100).toFixed(1)}%.`,
  };
}

/**
 * Free Cash Flow (FCF) / Net Disposable Income
 * Formula: FCF = Monthly Income - Living Expenses - Total Monthly Debt
 */
export function calculateFreeCashFlow(
  grossMonthlyIncome: number,
  estimatedLivingExpenses: number,
  totalMonthlyDebtObligations: number
): CalculationResult {
  const fcf = grossMonthlyIncome - estimatedLivingExpenses - totalMonthlyDebtObligations;

  return {
    value: fcf,
    formatted: `₹${fcf.toLocaleString('en-IN')}`,
    formula: 'FCF = Income - Living Expenses - Total Debt Obligations',
    inputs: {
      grossMonthlyIncome,
      estimatedLivingExpenses,
      totalMonthlyDebtObligations,
    },
    explanation: fcf >= 0
      ? `Positive surplus cash flow of ₹${fcf.toLocaleString('en-IN')}/month remaining after living expenses and loan servicing obligations.`
      : `Deficit cash flow of -₹${Math.abs(fcf).toLocaleString('en-IN')}/month; monthly obligations exceed recognized regular income.`,
  };
}

/**
 * Debt Service Coverage Ratio (DSCR)
 * Formula: Net Operating / Disposable Income / Total Debt Service
 */
export function calculateDSCR(
  netMonthlyDisposableIncomeBeforeDebt: number,
  totalMonthlyDebtService: number
): CalculationResult {
  if (totalMonthlyDebtService <= 0) {
    return {
      value: 99.9,
      formatted: 'N/A (No Debt)',
      formula: 'DSCR = Disposable Income / Debt Service',
      inputs: { netMonthlyDisposableIncomeBeforeDebt, totalMonthlyDebtService },
      explanation: 'Borrower has zero debt servicing requirements.',
    };
  }

  const dscr = Number((netMonthlyDisposableIncomeBeforeDebt / totalMonthlyDebtService).toFixed(2));
  return {
    value: dscr,
    formatted: `${dscr}x`,
    formula: 'DSCR = Disposable Income / Total Debt Service',
    inputs: { netMonthlyDisposableIncomeBeforeDebt, totalMonthlyDebtService },
    explanation: `Available income covers total debt servicing obligations by ${dscr} times. Standard institutional baseline is 1.25x.`,
  };
}
