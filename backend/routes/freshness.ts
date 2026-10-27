import { Router } from 'express';
import { analyzeFreshness } from '../../ai-services/freshnessService.js';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Evaluate perishable freshness & optical decay
router.post('/evaluate', async (req: AuthenticatedRequest, res) => {
  try {
    const { imageBase64, imageMimeType, itemHint, imageUrl } = req.body;

    const analysis = await analyzeFreshness(imageBase64, imageMimeType, itemHint);

    const record = {
      id: `fresh-${Date.now()}`,
      userId: req.user?.id || 'usr-foodverse-demo',
      ...analysis,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
      timestamp: new Date().toISOString(),
    };

    store.freshnessReports.unshift(record);

    res.json({
      success: true,
      data: record,
    });
  } catch (err: any) {
    console.error('Freshness evaluation error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to analyze food freshness.',
    });
  }
});

// Freshness history & perishable inventory tracker
router.get('/history', (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: store.freshnessReports,
  });
});

export default router;
