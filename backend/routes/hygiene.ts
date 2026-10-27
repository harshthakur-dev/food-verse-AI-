import { Router } from 'express';
import { analyzeKitchenHygiene } from '../../ai-services/hygieneInspectionService.js';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Run video/frame inspection on kitchen prep stations
router.post('/inspect', async (req: AuthenticatedRequest, res) => {
  try {
    const { videoOrFrameBase64, mediaMimeType, stationHint } = req.body;

    const report = await analyzeKitchenHygiene(videoOrFrameBase64, mediaMimeType, stationHint);

    const record = {
      id: `audit-${Date.now()}`,
      userId: req.user?.id || 'usr-foodverse-demo',
      ...report,
    };

    store.hygieneAudits.unshift(record);

    res.json({
      success: true,
      data: record,
    });
  } catch (err: any) {
    console.error('Hygiene inspection error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to inspect kitchen hygiene.',
    });
  }
});

// Get kitchen audit logs
router.get('/audits', (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: store.hygieneAudits,
  });
});

export default router;
