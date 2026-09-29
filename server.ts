import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './server/routes/auth.js';
import { applicationsRouter } from './server/routes/applications.js';
import { documentsRouter } from './server/routes/documents.js';
import { underwritingRouter } from './server/routes/underwriting.js';
import { memoRouter } from './server/routes/memo.js';
import { reviewRouter } from './server/routes/review.js';
import { activityRouter } from './server/routes/activity.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api', documentsRouter);
  app.use('/api', underwritingRouter);
  app.use('/api', memoRouter);
  app.use('/api', reviewRouter);
  app.use('/api', activityRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'Lendy AI Underwriting Copilot Engine',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lendy Underwriting Copilot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
