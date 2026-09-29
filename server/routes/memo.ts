import { Router } from 'express';
import { store } from '../db/store.js';
import { generateCreditMemoAI } from '../gemini/client.js';

export const memoRouter = Router();

// POST /api/applications/:id/memo/generate - Generate or regenerate credit memo
memoRouter.post('/applications/:id/memo/generate', async (req, res) => {
  const appId = req.params.id;
  const appData = store.getApplication(appId);

  if (!appData) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${appId} not found.` },
    });
  }

  try {
    const findingsList = store.findings.get(appId) || [];
    const metricsSummary = `
- Gross Monthly Income: ₹${appData.application.monthlyIncome.toLocaleString('en-IN')}
- Existing Debt: ₹${appData.application.monthlyDebt.toLocaleString('en-IN')}
- New Loan EMI: ₹${appData.metrics.emi.value.toLocaleString('en-IN')}
- Proposed Total DTI: ${appData.metrics.proposedDTI.formatted}
- Collateral LTV: ${appData.metrics.ltv.formatted}
- Net Free Cash Flow: ${appData.metrics.freeCashFlow.formatted}
- DSCR: ${appData.metrics.dscr.formatted}`;

    const findingsSummary = findingsList.length > 0
      ? findingsList.map(f => `[${f.severity}] ${f.title}: ${f.explanation}`).join('\n')
      : 'No critical negative exceptions identified; application reflects standard parameters.';

    const policiesSummary = appData.policies.map(p => `[${p.result}] ${p.policyName}: ${p.explanation}`).join('\n');
    const documentsSummary = appData.documents.map(d => `${d.documentType} (${d.fileName}): ${d.extractedSnippet || 'Verified'}`).join('\n');

    const memoContent = await generateCreditMemoAI({
      borrowerName: appData.borrower?.name || 'Applicant',
      employmentType: appData.borrower?.employmentType || 'Salaried',
      employer: appData.borrower?.employer || 'Corporate',
      yearsEmployed: appData.borrower?.yearsEmployed || 2,
      loanId: appId,
      loanAmount: appData.application.loanAmount,
      loanPurpose: appData.application.loanPurpose,
      tenureMonths: appData.application.loanTenure,
      interestRate: appData.application.interestRate,
      creditScore: appData.application.creditScore,
      monthlyIncome: appData.application.monthlyIncome,
      monthlyDebt: appData.application.monthlyDebt,
      newLoanEMI: appData.metrics.emi.value,
      proposedDTI: appData.metrics.proposedDTI.formatted,
      ltv: appData.metrics.ltv.formatted,
      freeCashFlow: appData.metrics.freeCashFlow.formatted,
      dscr: appData.metrics.dscr.formatted,
      metricsSummary,
      findingsSummary,
      policiesSummary,
      documentsSummary,
    });

    const memo = store.saveCreditMemo(appId, memoContent);

    res.json({
      success: true,
      data: memo,
    });
  } catch (error: any) {
    console.error('Error generating credit memo:', error);
    res.status(500).json({
      success: false,
      error: { code: 'MEMO_GEN_ERROR', message: error.message || 'Failed to generate credit memo.' },
    });
  }
});

// GET /api/applications/:id/memo - Retrieve existing credit memo
memoRouter.get('/applications/:id/memo', (req, res) => {
  const appId = req.params.id;
  const memo = store.memos.get(appId);
  if (!memo) {
    return res.json({
      success: true,
      data: null,
    });
  }
  res.json({
    success: true,
    data: memo,
  });
});

// PATCH /api/applications/:id/memo - Update/edit existing credit memo content
memoRouter.patch('/applications/:id/memo', (req, res) => {
  const appId = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Memo content is required.' },
    });
  }

  const updatedMemo = store.saveCreditMemo(appId, content, 'Human Underwriter (Manual Edit)');
  res.json({
    success: true,
    data: updatedMemo,
  });
});
