import { Router } from 'express';
import { store } from '../db/store.js';

export const documentsRouter = Router();

// GET /api/applications/:id/documents
documentsRouter.get('/applications/:id/documents', (req, res) => {
  const appId = req.params.id;
  const docs = Array.from(store.documents.values()).filter(d => d.applicationId === appId);
  res.json({
    success: true,
    data: docs,
  });
});

// POST /api/applications/:id/documents - Upload document
documentsRouter.post('/applications/:id/documents', (req, res) => {
  const appId = req.params.id;
  const { documentType, fileName, snippet, fileSizeBytes } = req.body;

  if (!documentType || !fileName) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'documentType and fileName are required.' },
    });
  }

  const doc = store.addDocument(appId, {
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
documentsRouter.delete('/documents/:id', (req, res) => {
  const docId = req.params.id;
  const deleted = store.deleteDocument(docId);
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
