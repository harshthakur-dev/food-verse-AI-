import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { authMiddleware } from './backend/middleware/auth.js';
import authRoutes from './backend/routes/auth.js';
import foodRoutes from './backend/routes/food.js';
import freshnessRoutes from './backend/routes/freshness.js';
import hygieneRoutes from './backend/routes/hygiene.js';
import cookingRoutes from './backend/routes/cooking.js';
import mealplansRoutes from './backend/routes/mealplans.js';
import statsRoutes from './backend/routes/stats.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Parse JSON and URL-encoded bodies with 50mb limit for multimodal image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Global Auth Middleware
  app.use('/api', authMiddleware);

  // Mount API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/food', foodRoutes);
  app.use('/api/freshness', freshnessRoutes);
  app.use('/api/hygiene', hygieneRoutes);
  app.use('/api/cooking', cookingRoutes);
  app.use('/api/mealplans', mealplansRoutes);
  app.use('/api/stats', statsRoutes);

  // System Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'Food Verse AI Fullstack Engine',
      timestamp: new Date().toISOString(),
      capabilities: [
        'Multimodal Vision Food Recognition',
        'Optical Freshness & Spoilage Classifier',
        'Kitchen CCTV Hygiene & Compliance Auditor',
        'Smart Cooking Assistant & Pantry Matcher',
        'Personalized 7-Day Macro Nutrition Planner',
      ],
    });
  });

  if (!isProduction) {
    // Development mode: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev] Mounted Vite middlewares on Express server');
  } else {
    // Production mode: Serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food Verse AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
