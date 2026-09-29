import { Router } from 'express';
import { store } from '../db/store.js';

export const activityRouter = Router();

// GET /api/applications/:id/activity - Get audit logs for specific application
activityRouter.get('/applications/:id/activity', (req, res) => {
  const appId = req.params.id;
  const logs = store.getAuditLogs(appId);
  res.json({
    success: true,
    data: logs,
  });
});

// GET /api/activity - Get all system activity logs
activityRouter.get('/activity', (req, res) => {
  const logs = store.getAuditLogs();
  res.json({
    success: true,
    data: logs,
  });
});
