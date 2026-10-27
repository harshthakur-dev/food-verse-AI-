import { Router } from 'express';
import { store } from '../db/store.js';
import { isGeminiConfigured } from '../../ai-services/geminiClient.js';

const router = Router();

// Epics & Tasks Tracker (9 Epics, 16 Tasks)
router.get('/epics', (req, res) => {
  const totalTasks = store.epics.reduce((acc, epic) => acc + epic.tasks.length, 0);
  const completedTasks = store.epics.reduce(
    (acc, epic) => acc + epic.tasks.filter((t) => t.completed).length,
    0
  );

  res.json({
    success: true,
    data: {
      totalEpics: store.epics.length,
      totalTasks,
      completedTasks,
      progressPercentage: Math.round((completedTasks / totalTasks) * 100),
      epics: store.epics,
    },
  });
});

// Platform Overview Stats
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      aiConfigured: isGeminiConfigured(),
      systemHealth: 'OPERATIONAL',
      activeModel: 'gemini-3.8-flash',
      totalFoodScans: store.foodScans.length,
      totalFreshnessReports: store.freshnessReports.length,
      totalHygieneAudits: store.hygieneAudits.length,
      totalSavedRecipes: store.savedRecipes.length,
      activeMealPlans: store.mealPlans.length,
      recentScans: store.foodScans.slice(0, 4),
      recentFreshness: store.freshnessReports.slice(0, 3),
      recentAudits: store.hygieneAudits.slice(0, 2),
      pythonFastApiBridge: {
        status: 'READY',
        endpoint: '/ai-services/python_fastapi_agent/main.py',
        framework: 'FastAPI / Uvicorn',
      },
    },
  });
});

export default router;
