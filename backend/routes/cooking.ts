import { Router } from 'express';
import { generateSmartRecipe, askChefAssistant } from '../../ai-services/cookingChefService.js';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Generate dynamic recipe from available pantry ingredients
router.post('/generate-recipe', async (req: AuthenticatedRequest, res) => {
  try {
    const { ingredients, dietaryPreference, targetTimeMinutes, skillLevel } = req.body;
    const ingList = Array.isArray(ingredients) && ingredients.length > 0 ? ingredients : ['Eggs', 'Tomatoes', 'Olive Oil', 'Herbs'];

    const recipe = await generateSmartRecipe(ingList, dietaryPreference, targetTimeMinutes, skillLevel);

    res.json({
      success: true,
      data: recipe,
    });
  } catch (err: any) {
    console.error('Recipe generation error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate recipe.',
    });
  }
});

// Real-time culinary Q&A and voice chef advisor
router.post('/ask-chef', async (req: AuthenticatedRequest, res) => {
  try {
    const { query, recipeContext } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required.' });
    }

    const advice = await askChefAssistant(query, recipeContext);

    res.json({
      success: true,
      data: advice,
    });
  } catch (err: any) {
    console.error('Ask chef error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to query Chef AI.',
    });
  }
});

// Save recipe to favorites
router.post('/save', (req: AuthenticatedRequest, res) => {
  const { recipe } = req.body;
  if (!recipe) {
    return res.status(400).json({ success: false, message: 'Recipe payload required.' });
  }

  const existing = store.savedRecipes.find((r) => r.id === recipe.id);
  if (!existing) {
    store.savedRecipes.push(recipe);
  }

  res.json({
    success: true,
    message: 'Recipe saved to your cookbook.',
    data: store.savedRecipes,
  });
});

// Get saved recipes
router.get('/saved', (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: store.savedRecipes,
  });
});

export default router;
