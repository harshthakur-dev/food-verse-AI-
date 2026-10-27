import { ai, DEFAULT_MODEL, isGeminiConfigured } from './geminiClient.js';

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  durationSeconds?: number;
  isTimerRequired?: boolean;
  proTip?: string;
  visualCue?: string;
  audioVoiceGuidance?: string;
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  summary: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Intermediate' | 'Master Chef';
  cuisine: string;
  nutritionalEstimatePerServing: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  matchedIngredients: string[];
  missingPantryPicks: string[];
  equipmentNeeded: string[];
  steps: CookingStep[];
  substitutions: Array<{
    original: string;
    substitute: string;
    rationale: string;
  }>;
}

export async function generateSmartRecipe(
  ingredients: string[],
  dietaryPreference?: string,
  targetTimeMinutes?: number,
  skillLevel: string = 'Intermediate'
): Promise<GeneratedRecipe> {
  if (isGeminiConfigured() && ai) {
    try {
      const prompt = `You are Food Verse AI's Michelin-trained Executive Chef and Smart Culinary Assistant.
Create an inventive, restaurant-quality recipe utilizing these available pantry ingredients:
Ingredients available: ${ingredients.join(', ')}
Dietary preference: ${dietaryPreference || 'Balanced & wholesome'}
Target max cook time: ${targetTimeMinutes || 30} minutes
Skill level: ${skillLevel}

Return ONLY raw parseable JSON adhering strictly to this schema:
{
  "id": "recipe-${Date.now()}",
  "title": "Creative Dish Title",
  "summary": "Short appetite-whetting description of flavor profiles and textures.",
  "prepTimeMinutes": 10,
  "cookTimeMinutes": 20,
  "servings": 2,
  "difficulty": "Easy" or "Intermediate" or "Master Chef",
  "cuisine": "e.g. Mediterranean, Asian Bistro, French Contemporary",
  "nutritionalEstimatePerServing": {
    "calories": 480,
    "proteinGrams": 28,
    "carbsGrams": 42,
    "fatGrams": 18
  },
  "matchedIngredients": ["Ingredient 1 with measurement", "Ingredient 2"],
  "missingPantryPicks": ["Olive oil", "Salt & black pepper"],
  "equipmentNeeded": ["Non-stick skillet", "Chef's knife", "Tongs"],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Detailed clear action.",
      "durationSeconds": 180,
      "isTimerRequired": true,
      "proTip": "Chef secret tip for superior browning or emulsification.",
      "visualCue": "Sizzle subsides and golden-brown crust forms.",
      "audioVoiceGuidance": "Spoken sentence to guide the cook step by step."
    }
  ],
  "substitutions": [
    {
      "original": "Butter",
      "substitute": "Extra Virgin Olive Oil",
      "rationale": "Lowers saturated fat while retaining silky mouthfeel."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '{}';
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return sanitizeRecipeResult(parsed, ingredients);
    } catch (err) {
      console.error('Gemini smart chef generation error, using curated chef formulation:', err);
    }
  }

  return generateDeterministicRecipe(ingredients, dietaryPreference);
}

export async function askChefAssistant(
  userQuery: string,
  recipeContext?: string
): Promise<{ answer: string; suggestedFollowUps: string[] }> {
  if (isGeminiConfigured() && ai) {
    try {
      const prompt = `You are Food Verse AI's voice-activated conversational Master Chef.
User question: "${userQuery}"
${recipeContext ? `Active cooking recipe context: ${recipeContext}` : ''}
Provide an expert, concise, encouraging answer (2-4 sentences max). Offer practical culinary physics/science and culinary tips.
Return raw JSON:
{
  "answer": "Chef response text...",
  "suggestedFollowUps": ["Question 1", "Question 2"]
}`;

      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const cleanJson = (response.text || '{}').replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        answer: parsed.answer || 'Keep heat medium-high to achieve the Maillard reaction without scorching your aromatics.',
        suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [
          'How do I test doneness without a thermometer?',
          'What wine or beverage pairs best with this?'
        ],
      };
    } catch (err) {
      console.error('Gemini chef query error:', err);
    }
  }

  // Fallback chef advice
  return {
    answer: `Chef advice for "${userQuery}": Always balance acid (lemon, vinegar) with fat and salt. If a dish tastes flat, a splash of citrus or a pinch of flaked salt brightens the flavor spectrum immediately!`,
    suggestedFollowUps: [
      'How to salvage an over-salted sauce?',
      'Best oil smoke points for searing vs sauteing'
    ],
  };
}

function sanitizeRecipeResult(data: any, originalIngredients: string[]): GeneratedRecipe {
  return {
    id: data.id || `recipe-${Date.now()}`,
    title: data.title || 'Artisan Pantry Skillet Symphony',
    summary: data.summary || 'A rapid, fragrant saute marrying crisp textures and caramelized pan sauces.',
    prepTimeMinutes: Number(data.prepTimeMinutes) || 10,
    cookTimeMinutes: Number(data.cookTimeMinutes) || 15,
    servings: Number(data.servings) || 2,
    difficulty: data.difficulty || 'Easy',
    cuisine: data.cuisine || 'Modern Fusion',
    nutritionalEstimatePerServing: {
      calories: Number(data.nutritionalEstimatePerServing?.calories) || 420,
      proteinGrams: Number(data.nutritionalEstimatePerServing?.proteinGrams) || 22,
      carbsGrams: Number(data.nutritionalEstimatePerServing?.carbsGrams) || 36,
      fatGrams: Number(data.nutritionalEstimatePerServing?.fatGrams) || 14,
    },
    matchedIngredients: Array.isArray(data.matchedIngredients) && data.matchedIngredients.length > 0
      ? data.matchedIngredients
      : originalIngredients.map((i) => `Fresh ${i}`),
    missingPantryPicks: Array.isArray(data.missingPantryPicks) ? data.missingPantryPicks : ['Olive oil', 'Sea salt', 'Cracked pepper'],
    equipmentNeeded: Array.isArray(data.equipmentNeeded) ? data.equipmentNeeded : ['Chef Knife', 'Large Skillet', 'Wooden Spoon'],
    steps: Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : [
      {
        stepNumber: 1,
        instruction: 'Mise en place: Wash, pat dry, and slice all primary ingredients into uniform bite-sized pieces for even cooking.',
        durationSeconds: 120,
        isTimerRequired: false,
        proTip: 'Uniform cuts guarantee all ingredients reach optimal tenderness at the exact same moment.',
        visualCue: 'Clean organized cutting board ready for pan transfer.',
        audioVoiceGuidance: 'Prep your ingredients by chopping them into uniform slices.'
      },
      {
        stepNumber: 2,
        instruction: 'Heat high-smoke point oil in skillet over medium-high heat until shimmering. Add primary aromatics and saute for 2 minutes.',
        durationSeconds: 120,
        isTimerRequired: true,
        proTip: 'Wait until oil ripples before food hits the pan to prevent oil absorption and ensure a crisp sear.',
        visualCue: 'Fragrant steam and translucent aromatics.',
        audioVoiceGuidance: 'Heat the skillet with oil until shimmering, then saute your aromatics for two minutes.'
      },
      {
        stepNumber: 3,
        instruction: 'Add remaining ingredients, toss vigorously, and deglaze with a splash of broth or water. Cover and simmer 5 minutes.',
        durationSeconds: 300,
        isTimerRequired: true,
        proTip: 'Scrape the fond (flavorful browned bits) from the bottom of the pan into the sauce.',
        visualCue: 'Sauce reduces into a glossy glaze coating the ingredients.',
        audioVoiceGuidance: 'Toss in your remaining ingredients and simmer for five minutes until tender.'
      }
    ],
    substitutions: Array.isArray(data.substitutions) ? data.substitutions : [
      { original: 'Dairy Milk', substitute: 'Unsweetened Almond or Oat Milk', rationale: 'Maintains liquid ratio without lactose.' }
    ],
  };
}

export function generateDeterministicRecipe(
  ingredients: string[],
  dietaryPreference?: string
): GeneratedRecipe {
  const ingStr = ingredients.join(' ').toLowerCase();

  if (ingStr.includes('egg') || ingStr.includes('cheese') || ingStr.includes('tomato') || ingStr.includes('spinach')) {
    return {
      id: 'recipe-shakshuka-1',
      title: 'Mediterranean Skillet Shakshuka with Poached Farm Eggs',
      summary: 'A vibrant, spiced tomato and bell pepper sauce cradling softly poached eggs, sprinkled with fresh herbs.',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 2,
      difficulty: 'Easy',
      cuisine: 'North African / Mediterranean',
      nutritionalEstimatePerServing: {
        calories: 320,
        proteinGrams: 18,
        carbsGrams: 22,
        fatGrams: 16,
      },
      matchedIngredients: [
        '4 Fresh Eggs',
        '1 cup Crushed Tomatoes or diced fresh tomatoes',
        '1 Bell Pepper (sliced thinly)',
        '1/2 Onion & 2 Garlic Cloves',
        '1 tsp Ground Cumin & Paprika',
      ],
      missingPantryPicks: ['Extra virgin olive oil', 'Sea salt', 'Parsley or cilantro garnish'],
      equipmentNeeded: ['Cast Iron or Stainless Skillet', 'Spatula', 'Chef Knife'],
      steps: [
        {
          stepNumber: 1,
          instruction: 'Heat 2 tablespoons olive oil in your skillet over medium heat. Add diced onions and bell peppers; cook for 4-5 minutes until tender and sweet.',
          durationSeconds: 240,
          isTimerRequired: true,
          proTip: 'Sweat the peppers slowly to caramelize their natural sugars before adding the acid.',
          visualCue: 'Onions become translucent and peppers soften.',
          audioVoiceGuidance: 'Saute your onions and peppers gently in olive oil until sweet and tender.'
        },
        {
          stepNumber: 2,
          instruction: 'Stir in minced garlic, cumin, and sweet paprika. Cook for 60 seconds until fragrant, then pour in tomatoes. Simmer gently for 5 minutes.',
          durationSeconds: 300,
          isTimerRequired: true,
          proTip: 'Blooming ground spices in warm oil releases fat-soluble aroma compounds.',
          visualCue: 'Thick, rich red bubbling sauce.',
          audioVoiceGuidance: 'Bloom the garlic and spices for one minute, then pour in the tomatoes.'
        },
        {
          stepNumber: 3,
          instruction: 'Use a large spoon to make 4 shallow wells in the sauce. Gently crack an egg into each well. Cover with a lid and cook on low for 5-6 minutes until whites are set and yolks are runny.',
          durationSeconds: 330,
          isTimerRequired: true,
          proTip: 'Remove pan from heat 1 minute before completion; residual steam finishes the whites flawlessly.',
          visualCue: 'Opaque white egg whites with golden, jiggling yolk centers.',
          audioVoiceGuidance: 'Crack each egg into the wells, cover, and let simmer for five to six minutes.'
        }
      ],
      substitutions: [
        { original: 'Eggs', substitute: 'Firm Silken Tofu or Chickpeas', rationale: 'For a 100% plant-based high-protein alternative.' },
        { original: 'Paprika', substitute: 'Chili Flakes or Harissa Paste', rationale: 'Adds fiery depth.' }
      ]
    };
  }

  // General Herb Scented Saute
  return {
    id: `recipe-pantry-${Date.now()}`,
    title: 'Herb-Glazed Medley with Crispy Aromatics & Pan Emulsion',
    summary: 'A fast, nutrient-packed dish highlighting crisp textures, natural vitamins, and a savory pan reduction.',
    prepTimeMinutes: 8,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Contemporary Bistro',
    nutritionalEstimatePerServing: {
      calories: 380,
      proteinGrams: 24,
      carbsGrams: 28,
      fatGrams: 14,
    },
    matchedIngredients: ingredients.map(i => `Fresh ${i}`),
    missingPantryPicks: ['Cold-pressed olive oil', 'Fresh lemon juice', 'Cracked sea salt', 'Crushed black peppercorns'],
    equipmentNeeded: ['Chef Knife', 'Large Saute Pan', 'Tongs'],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Slice ingredients into uniform geometric cuts to guarantee synchronized cooking.',
        durationSeconds: 180,
        isTimerRequired: false,
        proTip: 'Dry all vegetables thoroughly before pan contact to prevent steaming and maximize caramelization.',
        visualCue: 'Evenly diced components ready on cutting board.',
        audioVoiceGuidance: 'Mince and slice your ingredients evenly so they cook at the exact same pace.'
      },
      {
        stepNumber: 2,
        instruction: 'Heat skillet over medium-high heat with a drizzle of oil. Add firmer items first, searing for 3 minutes without disturbing.',
        durationSeconds: 180,
        isTimerRequired: true,
        proTip: 'Resist the urge to shake the pan right away; quiet contact creates a delicious golden crust.',
        visualCue: 'Light golden browning along the pan contact edges.',
        audioVoiceGuidance: 'Sear your firmer ingredients in a hot skillet for three minutes without shaking.'
      },
      {
        stepNumber: 3,
        instruction: 'Add tender ingredients, toss in aromatic herbs, season with salt, and finish with a squeeze of fresh lemon juice.',
        durationSeconds: 180,
        isTimerRequired: true,
        proTip: 'Finishing with fresh citrus acid lifts all heavy flavors and balances the savoriness.',
        visualCue: 'Bright colors and glossy, aromatic glaze.',
        audioVoiceGuidance: 'Toss together with herbs, season with salt and pepper, and finish with lemon.'
      }
    ],
    substitutions: [
      { original: 'Butter', substitute: 'Extra Virgin Olive Oil', rationale: 'Heart-healthy monounsaturated fat.' }
    ]
  };
}
