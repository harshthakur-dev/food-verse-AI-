export type ActiveTab =
  | 'overview'
  | 'food-scanner'
  | 'freshness'
  | 'hygiene'
  | 'cooking'
  | 'meal-planner'
  | 'architecture';

export interface NutritionalBreakdown {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sodiumMg: number;
  sugarGrams: number;
  glycemicIndex: 'Low' | 'Medium' | 'High';
}

export interface DetectedIngredient {
  name: string;
  estimatedWeight: string;
  confidence: number;
}

export interface FoodScan {
  id: string;
  dishName: string;
  category: string;
  cuisine: string;
  servingSize: string;
  healthScore: number;
  healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  nutritionalBreakdown: NutritionalBreakdown;
  detectedIngredients: DetectedIngredient[];
  allergens: string[];
  dietaryTags: string[];
  insights: string[];
  recommendation: string;
  timestamp: string;
  imageUrl?: string;
}

export type FreshnessStatus = 'Fresh' | 'Moderately Fresh' | 'Spoiled';

export interface FreshnessReport {
  id: string;
  itemName: string;
  category: string;
  status: FreshnessStatus;
  freshnessScore: number;
  estimatedShelfLifeDays: number;
  confidence: number;
  sensoryIndicators: {
    colorIntegrity: number;
    surfaceTexture: number;
    moistureBalance: number;
    microbialRisk: number;
  };
  visualMarkers: string[];
  safetyVerdict: 'Safe for Consumption' | 'Cook/Consume Promptly' | 'Hazardous - Discard';
  actionableGuidance: string;
  storageOptimizations: string[];
  timestamp: string;
  imageUrl?: string;
}

export interface HygieneViolation {
  id: string;
  category: 'PPE_GLOVES' | 'PPE_HAIRNET' | 'CROSS_CONTAMINATION' | 'SURFACE_SANITATION' | 'TEMPERATURE_CONTROL' | 'HANDWASHING';
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  description: string;
  timestamp: string;
  confidence: number;
  locationInFrame: string;
  correctiveAction: string;
}

export interface HygieneInspectionReport {
  id: string;
  stationName: string;
  inspectionTimestamp: string;
  overallScore: number;
  letterGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Critical Failure';
  complianceBreakdown: {
    gloveCompliancePercent: number;
    hairCapCompliancePercent: number;
    crossContaminationScore: number;
    surfaceCleanlinessScore: number;
    foodSafetyProtocolsScore: number;
  };
  detectedViolations: HygieneViolation[];
  positiveObservations: string[];
  auditorSummary: string;
  haccpCertificationStatus: 'PASSED' | 'CONDITIONAL_APPROVAL' | 'FAILED_REINSPECTION_REQUIRED';
}

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  durationSeconds?: number;
  isTimerRequired?: boolean;
  proTip?: string;
  visualCue?: string;
  audioVoiceGuidance?: string;
}

export interface Recipe {
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

export interface GroceryItem {
  name: string;
  amount: string;
  checked: boolean;
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface MealPlan {
  planId: string;
  title: string;
  dietaryStyle: string;
  dailyCalorieTarget: number;
  targetGoal: string;
  days: DayMealPlan[];
  groceryList: GroceryCategory[];
  nutritionistNotes: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dietaryGoal: string;
  calorieTarget: number;
  allergies: string[];
  role: 'user' | 'chef' | 'auditor' | 'admin';
}

export interface EpicTask {
  id: string;
  taskNumber: number;
  title: string;
  completed: boolean;
  layer: 'Frontend' | 'Backend' | 'AI Service';
}

export interface Epic {
  id: string;
  epicNumber: number;
  title: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Ready for Review';
  tasks: EpicTask[];
}
