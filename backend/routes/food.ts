import { Router } from 'express';
import { analyzeFoodImage } from '../../ai-services/foodRecognitionService.js';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Recognize food and compute nutrition
router.post('/recognize', async (req: AuthenticatedRequest, res) => {
  try {
    const { imageBase64, imageMimeType, dishHint, imageUrl } = req.body;

    const analysis = await analyzeFoodImage(imageBase64, imageMimeType, dishHint);

    const record = {
      id: `scan-${Date.now()}`,
      userId: req.user?.id || 'usr-foodverse-demo',
      ...analysis,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      timestamp: new Date().toISOString(),
    };

    store.foodScans.unshift(record);

    res.json({
      success: true,
      data: record,
    });
  } catch (err: any) {
    console.error('Food recognition endpoint error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to analyze food image.',
    });
  }
});

// Get food scan history
router.get('/history', (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: store.foodScans,
  });
});

export default router;
