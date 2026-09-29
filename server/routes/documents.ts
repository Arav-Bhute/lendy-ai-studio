import { Router } from 'express';
import { store } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';

export const documentsRouter = Router();

// GET /api/applications/:id/documents
documentsRouter.get('/applications/:id/documents', async (req, res) => {
  const appId = req.params.id;
  const appData = await store.getApplication(appId);
  const docs = appData?.documents || Array.from(store.documents.values()).filter(d => d.applicationId === appId);
  res.json({
    success: true,
    data: docs,
  });
});

// POST /api/applications/:id/documents - Upload document
documentsRouter.post('/applications/:id/documents', async (req, res) => {
  const appId = req.params.id;
  const { documentType, fileName, snippet, fileSizeBytes } = req.body;

  if (!documentType || !fileName) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'documentType and fileName are required.' },
    });
  }

  const doc = await store.addDocument(appId, {
    documentType,
    fileName,
    snippet: snippet || `Extracted verified text from ${fileName}.`,
    fileSizeBytes: fileSizeBytes || 1200000,
  });

  res.status(201).json({
    success: true,
    data: doc,
  });
});

// DELETE /api/documents/:id - Delete document
documentsRouter.delete('/documents/:id', requireRole(['underwriter', 'admin']), async (req, res) => {
  const docId = req.params.id;
  const deleted = await store.deleteDocument(docId);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Document ${docId} not found.` },
    });
  }
  res.json({
    success: true,
    data: { id: docId, deleted: true },
  });
});
