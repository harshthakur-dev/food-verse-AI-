import { Router } from 'express';
import { generatePersonalizedMealPlan } from '../../ai-services/mealPlannerService.js';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Generate adaptive 7-day meal plan
router.post('/generate', async (req: AuthenticatedRequest, res) => {
  try {
    const { dietaryStyle, calorieTarget, targetGoal, allergies } = req.body;

    const plan = await generatePersonalizedMealPlan(
      dietaryStyle || req.user?.dietaryGoal || 'Mediterranean',
      Number(calorieTarget) || req.user?.calorieTarget || 2100,
      targetGoal || 'Optimal Health & Energy',
      Array.isArray(allergies) ? allergies : req.user?.allergies || []
    );

    // Store in active plans
    store.mealPlans = [plan, ...store.mealPlans.slice(0, 4)];

    res.json({
      success: true,
      data: plan,
    });
  } catch (err: any) {
    console.error('Meal plan generation error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate meal plan.',
    });
  }
});

// Get current active meal plan
router.get('/current', async (req: AuthenticatedRequest, res) => {
  if (store.mealPlans.length === 0) {
    // Generate default initial plan
    const initialPlan = await generatePersonalizedMealPlan(
      req.user?.dietaryGoal || 'Mediterranean',
      req.user?.calorieTarget || 2100,
      'Sustained Vitality & Health'
    );
    store.mealPlans.push(initialPlan);
  }

  res.json({
    success: true,
    data: store.mealPlans[0],
  });
});

// Toggle grocery checklist item
router.post('/toggle-grocery', (req: AuthenticatedRequest, res) => {
  const { categoryName, itemName } = req.body;
  if (store.mealPlans.length > 0) {
    const plan = store.mealPlans[0];
    const category = plan.groceryList.find((c: any) => c.category === categoryName);
    if (category) {
      const item = category.items.find((i: any) => i.name === itemName);
      if (item) {
        item.checked = !item.checked;
      }
    }
    return res.json({ success: true, data: plan.groceryList });
  }

  res.status(404).json({ success: false, message: 'No active meal plan found.' });
});

export default router;
