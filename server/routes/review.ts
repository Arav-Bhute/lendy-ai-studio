import { Router } from 'express';
import { store } from '../db/store.js';

export const reviewRouter = Router();

// POST /api/applications/:id/review - Record authorized human underwriter decision
reviewRouter.post('/applications/:id/review', (req, res) => {
  const appId = req.params.id;
  const { decision, notes, reviewerName } = req.body;

  if (!decision || !['APPROVE', 'REJECT', 'REQUEST_INFO'].includes(decision)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_DECISION', message: 'Decision must be APPROVE, REJECT, or REQUEST_INFO.' },
    });
  }

  const result = store.recordHumanDecision(
    appId,
    decision,
    notes || 'Decision recorded following explainable risk review.',
    reviewerName || 'Arjun Kapoor (Lead Underwriter)'
  );

  if (!result) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${appId} not found.` },
    });
  }

  res.json({
    success: true,
    data: result,
  });
});
