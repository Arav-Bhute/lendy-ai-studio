import { Router } from 'express';
import { store } from '../db/store.js';
import { runUnderwritingAIAnalysis } from '../gemini/client.js';
import { requireRole } from '../middleware/auth.js';

export const underwritingRouter = Router();

// POST /api/applications/:id/analyze - Trigger AI Underwriting Analysis
underwritingRouter.post('/applications/:id/analyze', async (req, res) => {
  const appId = req.params.id;
  const appData = await store.getApplication(appId);

  if (!appData) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${appId} not found.` },
    });
  }

  try {
    const analysis = await runUnderwritingAIAnalysis({
      applicationId: appId,
      borrower: {
        name: appData.borrower?.name || 'Applicant',
        dob: appData.borrower?.dateOfBirth || '1990-01-01',
        employmentType: appData.borrower?.employmentType || 'Salaried',
        employer: appData.borrower?.employer || 'Corporate',
        yearsEmployed: appData.borrower?.yearsEmployed || 2,
      },
      loan: {
        id: appId,
        amount: appData.application.loanAmount,
        purpose: appData.application.loanPurpose,
        tenureMonths: appData.application.loanTenure,
        interestRate: appData.application.interestRate,
        creditScore: appData.application.creditScore,
      },
      metrics: {
        monthlyIncome: appData.application.monthlyIncome,
        monthlyDebt: appData.application.monthlyDebt,
        newLoanEMI: appData.metrics.emi.value,
        existingDTI: appData.metrics.existingDTI.formatted,
        proposedDTI: appData.metrics.proposedDTI.formatted,
        ltv: appData.metrics.ltv.formatted,
        freeCashFlow: appData.metrics.freeCashFlow.formatted,
        dscr: appData.metrics.dscr.formatted,
      },
      policies: appData.policies,
      documents: appData.documents.map(d => ({
        documentType: d.documentType,
        fileName: d.fileName,
        snippet: d.extractedSnippet,
      })),
    });

    // Save findings to store
    store.saveFindings(appId, analysis.findings, analysis.overallRisk);

    const updatedApp = await store.getApplication(appId);

    res.json({
      success: true,
      data: {
        overallRisk: analysis.overallRisk,
        summary: analysis.summary,
        findings: analysis.findings,
        missingInformation: analysis.missingInformation,
        inconsistencies: analysis.inconsistencies,
        positiveSignals: analysis.positiveSignals,
        policyConcerns: analysis.policyConcerns,
        updatedMetrics: updatedApp?.metrics,
        updatedPolicies: updatedApp?.policies,
      },
    });
  } catch (error: any) {
    console.error('Error during AI Underwriting Analysis:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message || 'Failed to complete AI underwriting analysis.',
      },
    });
  }
});

// GET /api/applications/:id/findings
underwritingRouter.get('/applications/:id/findings', async (req, res) => {
  const appId = req.params.id;
  const appData = await store.getApplication(appId);
  const list = appData?.findings || store.findings.get(appId) || [];
  res.json({
    success: true,
    data: list,
  });
});

// GET /api/applications/:id/metrics
underwritingRouter.get('/applications/:id/metrics', async (req, res) => {
  const appId = req.params.id;
  const appData = await store.getApplication(appId);
  if (!appData) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${appId} not found.` },
    });
  }
  res.json({
    success: true,
    data: appData.metrics,
  });
});

// GET /api/applications/:id/policies
underwritingRouter.get('/applications/:id/policies', async (req, res) => {
  const appId = req.params.id;
  const appData = await store.getApplication(appId);
  if (!appData) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${appId} not found.` },
    });
  }
  res.json({
    success: true,
    data: appData.policies,
  });
});

// PATCH /api/applications/:id/findings/:findingId - Underwriter signs off / reviews finding
underwritingRouter.patch('/applications/:id/findings/:findingId', requireRole(['underwriter', 'admin']), async (req, res) => {
  const { id, findingId } = req.params;
  const { status, reviewerNotes } = req.body;

  const updated = store.updateFindingStatus(id, findingId, status || 'REVIEWED', reviewerNotes);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Finding ${findingId} not found for application ${id}.` },
    });
  }

  res.json({
    success: true,
    data: updated,
  });
});
