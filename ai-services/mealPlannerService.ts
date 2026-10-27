import { ai, DEFAULT_MODEL, isGeminiConfigured } from './geminiClient.js';

export interface MealItem {
  id: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cookingTimeMinutes: number;
  shortDescription: string;
  keyIngredients: string[];
}

export interface DayMealPlan {
  dayNumber: number;
  dayName: string;
  dailyTotalCalories: number;
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  micronutrientFocus: string;
  meals: MealItem[];
}

export interface GroceryCategory {
  category: string; // e.g. 'Fresh Produce', 'Lean Proteins & Dairy', 'Pantry & Spices'
  items: Array<{
    name: string;
    amount: string;
    checked: boolean;
  }>;
}

export interface PersonalizedMealPlanResult {
  planId: string;
  title: string;
  dietaryStyle: string;
  dailyCalorieTarget: number;
  targetGoal: string;
  days: DayMealPlan[];
  groceryList: GroceryCategory[];
  nutritionistNotes: string[];
}

export async function generatePersonalizedMealPlan(
  dietaryStyle: string = 'Mediterranean',
  calorieTarget: number = 2000,
  targetGoal: string = 'Optimal Energy & Metabolic Health',
  allergies: string[] = []
): Promise<PersonalizedMealPlanResult> {
  if (isGeminiConfigured() && ai) {
    try {
      const prompt = `You are Food Verse AI's certified Clinical Nutritionist and Multimodal Meal Architect.
Generate a structured 7-day personalized meal plan tailored to:
- Dietary Style: ${dietaryStyle}
- Target Daily Calories: ${calorieTarget} kcal
- Primary Fitness / Health Goal: ${targetGoal}
- Excluded Allergens / Intolerances: ${allergies.length > 0 ? allergies.join(', ') : 'None'}

Return ONLY raw JSON strictly adhering to this structure:
{
  "planId": "plan-${Date.now()}",
  "title": "7-Day ${dietaryStyle} Vitality Protocol",
  "dietaryStyle": "${dietaryStyle}",
  "dailyCalorieTarget": ${calorieTarget},
  "targetGoal": "${targetGoal}",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Monday",
      "dailyTotalCalories": ${calorieTarget},
      "macros": { "proteinGrams": 140, "carbsGrams": 180, "fatGrams": 65 },
      "micronutrientFocus": "Polyphenols & Omega-3 Fatty Acids",
      "meals": [
        {
          "id": "m-1-1",
          "name": "Steel-Cut Oats with Chia Seeds & Wild Blueberries",
          "mealType": "Breakfast",
          "calories": 420,
          "protein": 16,
          "carbs": 62,
          "fat": 12,
          "cookingTimeMinutes": 10,
          "shortDescription": "Slow-digesting complex carbs with high anthocyanin antioxidant content.",
          "keyIngredients": ["Steel-cut oats", "Chia seeds", "Almond milk", "Wild blueberries"]
        },
        {
          "id": "m-1-2",
          "name": "Mediterranean Quinoa Bowl with Herb Grilled Chicken",
          "mealType": "Lunch",
          "calories": 610,
          "protein": 48,
          "carbs": 55,
          "fat": 18,
          "cookingTimeMinutes": 20,
          "shortDescription": "Lean protein with complete amino acid grain base and kalamata olive drizzle.",
          "keyIngredients": ["Chicken breast", "Quinoa", "Cucumber", "Cherry tomatoes", "Olive oil"]
        },
        {
          "id": "m-1-3",
          "name": "Baked Wild Atlantic Salmon with Asparagus & Sweet Potato Mash",
          "mealType": "Dinner",
          "calories": 680,
          "protein": 52,
          "carbs": 48,
          "fat": 24,
          "cookingTimeMinutes": 25,
          "shortDescription": "Cardiovascular support rich in EPA/DHA and carotenoids.",
          "keyIngredients": ["Salmon fillet", "Sweet potato", "Asparagus spears", "Lemon", "Garlic"]
        },
        {
          "id": "m-1-4",
          "name": "Greek Yogurt with Crushed Walnuts & Honey",
          "mealType": "Snack",
          "calories": 280,
          "protein": 24,
          "carbs": 15,
          "fat": 11,
          "cookingTimeMinutes": 3,
          "shortDescription": "Probiotic-rich gut microbiome sustenance.",
          "keyIngredients": ["Plain Greek yogurt", "Walnuts", "Raw honey"]
        }
      ]
    }
  ],
  "groceryList": [
    {
      "category": "Produce & Fresh Herbs",
      "items": [
        { "name": "Wild Blueberries", "amount": "2 pints", "checked": false },
        { "name": "Asparagus", "amount": "2 bunches", "checked": false }
      ]
    },
    {
      "category": "Proteins & Seafood",
      "items": [
        { "name": "Wild Atlantic Salmon", "amount": "4 fillets (6oz ea)", "checked": false },
        { "name": "Free-Range Chicken Breast", "amount": "2 lbs", "checked": false }
      ]
    },
    {
      "category": "Grains & Pantry Staples",
      "items": [
        { "name": "Tricolor Quinoa", "amount": "1 bag", "checked": false },
        { "name": "Extra Virgin Olive Oil", "amount": "1 bottle", "checked": false }
      ]
    }
  ],
  "nutritionistNotes": [
    "Drink at least 2.5L of water daily to support nutrient absorption.",
    "Meals are timed to prevent postprandial glucose fluctuations."
  ]
}`;

      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.25,
        },
      });

      const responseText = response.text || '{}';
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return sanitizeMealPlanResult(parsed, dietaryStyle, calorieTarget, targetGoal);
    } catch (err) {
      console.error('Gemini meal plan generation error, using clinical blueprint:', err);
    }
  }

  return generateDeterministicMealPlan(dietaryStyle, calorieTarget, targetGoal);
}

function sanitizeMealPlanResult(
  data: any,
  dietaryStyle: string,
  calorieTarget: number,
  targetGoal: string
): PersonalizedMealPlanResult {
  return {
    planId: data.planId || `plan-${Date.now()}`,
    title: data.title || `7-Day ${dietaryStyle} Vitality Protocol`,
    dietaryStyle: data.dietaryStyle || dietaryStyle,
    dailyCalorieTarget: Number(data.dailyCalorieTarget) || calorieTarget,
    targetGoal: data.targetGoal || targetGoal,
    days: Array.isArray(data.days) && data.days.length > 0
      ? data.days
      : generateDeterministicMealPlan(dietaryStyle, calorieTarget, targetGoal).days,
    groceryList: Array.isArray(data.groceryList) && data.groceryList.length > 0
      ? data.groceryList
      : generateDeterministicMealPlan(dietaryStyle, calorieTarget, targetGoal).groceryList,
    nutritionistNotes: Array.isArray(data.nutritionistNotes) ? data.nutritionistNotes : [
      'Maintain adequate hydration between meals for enzymatic efficiency.',
      'All recipes can be prepped in batches to save up to 4 hours per week.'
    ],
  };
}

export function generateDeterministicMealPlan(
  dietaryStyle: string,
  calorieTarget: number,
  targetGoal: string
): PersonalizedMealPlanResult {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const days: DayMealPlan[] = dayNames.map((dayName, idx) => {
    const dayNumber = idx + 1;
    const isKeto = dietaryStyle.toLowerCase().includes('keto');
    const isPlant = dietaryStyle.toLowerCase().includes('vegan') || dietaryStyle.toLowerCase().includes('plant');
    
    const pTarget = isKeto ? 130 : isPlant ? 110 : 145;
    const cTarget = isKeto ? 30 : isPlant ? 240 : 180;
    const fTarget = isKeto ? 140 : isPlant ? 60 : 70;

    return {
      dayNumber,
      dayName,
      dailyTotalCalories: calorieTarget,
      macros: {
        proteinGrams: pTarget,
        carbsGrams: cTarget,
        fatGrams: fTarget,
      },
      micronutrientFocus: dayNumber % 2 === 0 ? 'Magnesium, Zinc & B-Complex' : 'Omega-3 EPA/DHA & Polyphenols',
      meals: [
        {
          id: `meal-${dayNumber}-1`,
          name: isKeto ? 'Avocado Spinach Egg Omelet with Goat Cheese' : isPlant ? 'Golden Turmeric Tofu Scramble with Sourdough' : 'Overnight Rolled Oats with Chia & Wild Berries',
          mealType: 'Breakfast',
          calories: Math.round(calorieTarget * 0.23),
          protein: Math.round(pTarget * 0.22),
          carbs: Math.round(cTarget * 0.25),
          fat: Math.round(fTarget * 0.24),
          cookingTimeMinutes: 12,
          shortDescription: 'Metabolic morning ignition with balanced micro-nutrients.',
          keyIngredients: isKeto ? ['Pasture Eggs', 'Avocado', 'Spinach', 'Goat Cheese'] : ['Organic Oats', 'Berries', 'Chia Seeds', 'Almond Milk']
        },
        {
          id: `meal-${dayNumber}-2`,
          name: isKeto ? 'Grilled Herb Salmon Salad with MCT Olive Dressing' : isPlant ? 'Moroccan Spiced Lentil & Sweet Potato Bowl' : 'Tricolor Quinoa Bowl with Charred Chicken & Avocado',
          mealType: 'Lunch',
          calories: Math.round(calorieTarget * 0.32),
          protein: Math.round(pTarget * 0.35),
          carbs: Math.round(cTarget * 0.30),
          fat: Math.round(fTarget * 0.32),
          cookingTimeMinutes: 20,
          shortDescription: 'Sustained cognitive focus meal avoiding midday insulin spikes.',
          keyIngredients: ['Clean Protein Choice', 'Mixed Greens', 'Olive Oil', 'Pumpkin Seeds']
        },
        {
          id: `meal-${dayNumber}-3`,
          name: isKeto ? 'Pan-Seared Grass-Fed Ribeye with Garlic Asparagus' : isPlant ? 'Thai Coconut Green Curry with Tempeh & Bok Choy' : 'Baked Lemon Herb Salmon with Roasted Vegetables',
          mealType: 'Dinner',
          calories: Math.round(calorieTarget * 0.35),
          protein: Math.round(pTarget * 0.33),
          carbs: Math.round(cTarget * 0.32),
          fat: Math.round(fTarget * 0.34),
          cookingTimeMinutes: 25,
          shortDescription: 'Recovery meal rich in bioavailable minerals for nocturnal cellular repair.',
          keyIngredients: ['Quality Protein', 'Cruciferous Greens', 'Herbs', 'Healthy Fat']
        },
        {
          id: `meal-${dayNumber}-4`,
          name: isKeto ? 'Roasted Macadamia Nuts & Dark Cacao Nib' : isPlant ? 'Hummus with Carrot & Cucumber Ribbons' : 'Greek Yogurt Parfait with Toasted Almonds',
          mealType: 'Snack',
          calories: Math.round(calorieTarget * 0.10),
          protein: Math.round(pTarget * 0.10),
          carbs: Math.round(cTarget * 0.13),
          fat: Math.round(fTarget * 0.10),
          cookingTimeMinutes: 4,
          shortDescription: 'Nutrient-dense bridge snack maintaining steady blood sugar.',
          keyIngredients: ['Nuts/Seeds', 'Raw Veggies or Yogurt']
        }
      ]
    };
  });

  return {
    planId: `plan-${Date.now()}`,
    title: `7-Day Precision ${dietaryStyle} Protocol`,
    dietaryStyle,
    dailyCalorieTarget: calorieTarget,
    targetGoal,
    days,
    groceryList: [
      {
        category: 'Fresh Farm Produce',
        items: [
          { name: 'Organic Hass Avocados', amount: '6 pieces', checked: false },
          { name: 'Baby Spinach & Arugula Box', amount: '2 tubs (16oz)', checked: true },
          { name: 'Fresh Asparagus Spears', amount: '2 bunches', checked: false },
          { name: 'Wild Blueberries & Blackberries', amount: '3 clamshells', checked: false },
          { name: 'Lemons & Limes', amount: '5 pieces', checked: true },
        ],
      },
      {
        category: 'Proteins & Seafood',
        items: [
          { name: 'Wild Alaskan Sockeye Salmon', amount: '4 portions (6oz)', checked: false },
          { name: 'Organic Free-Range Chicken Breast', amount: '3 lbs', checked: false },
          { name: 'Pasture-Raised Eggs', amount: '2 dozen', checked: true },
          { name: 'Greek Yogurt (Plain 2%)', amount: '32 oz tub', checked: false },
        ],
      },
      {
        category: 'Healthy Fats, Nuts & Pantry',
        items: [
          { name: 'Extra Virgin First Cold Pressed Olive Oil', amount: '1 bottle (750ml)', checked: true },
          { name: 'Raw Walnuts & Macadamia Nuts', amount: '1 lb', checked: false },
          { name: 'Organic Chia & Hemp Seeds', amount: '1 bag', checked: false },
          { name: 'Pink Himalayan Rock Salt & Peppercorns', amount: 'Pantry staple', checked: true },
        ],
      },
    ],
    nutritionistNotes: [
      'Tailored for optimal gut-brain axis communication and cellular energy.',
      'Hydration recommendation: 35ml per kg of bodyweight daily.',
      'Adjust carb intake ±10% on intense training days for glycogen replenishment.'
    ],
  };
}
