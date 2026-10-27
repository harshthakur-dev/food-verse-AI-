import {
  FoodScan,
  FreshnessReport,
  HygieneInspectionReport,
  Recipe,
  MealPlan,
  UserProfile,
  Epic,
} from '../types/foodverse.ts';

const BASE_URL = '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('foodverse_token') || 'usr-foodverse-demo';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth & Profile
  async getProfile(): Promise<{ success: boolean; user: UserProfile }> {
    return request('/api/auth/me');
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> {
    return request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  // Food Recognition
  async recognizeFood(payload: {
    imageBase64?: string;
    imageMimeType?: string;
    dishHint?: string;
    imageUrl?: string;
  }): Promise<{ success: boolean; data: FoodScan }> {
    return request('/api/food/recognize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getFoodScans(): Promise<{ success: boolean; data: FoodScan[] }> {
    return request('/api/food/history');
  },

  // Freshness
  async evaluateFreshness(payload: {
    imageBase64?: string;
    imageMimeType?: string;
    itemHint?: string;
    imageUrl?: string;
  }): Promise<{ success: boolean; data: FreshnessReport }> {
    return request('/api/freshness/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getFreshnessHistory(): Promise<{ success: boolean; data: FreshnessReport[] }> {
    return request('/api/freshness/history');
  },

  // Hygiene Monitoring
  async inspectHygiene(payload: {
    videoOrFrameBase64?: string;
    mediaMimeType?: string;
    stationHint?: string;
  }): Promise<{ success: boolean; data: HygieneInspectionReport }> {
    return request('/api/hygiene/inspect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getHygieneAudits(): Promise<{ success: boolean; data: HygieneInspectionReport[] }> {
    return request('/api/hygiene/audits');
  },

  // Smart Cooking
  async generateRecipe(payload: {
    ingredients: string[];
    dietaryPreference?: string;
    targetTimeMinutes?: number;
    skillLevel?: string;
  }): Promise<{ success: boolean; data: Recipe }> {
    return request('/api/cooking/generate-recipe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async askChef(payload: {
    query: string;
    recipeContext?: string;
  }): Promise<{ success: boolean; data: { answer: string; suggestedFollowUps: string[] } }> {
    return request('/api/cooking/ask-chef', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getSavedRecipes(): Promise<{ success: boolean; data: Recipe[] }> {
    return request('/api/cooking/saved');
  },

  async saveRecipe(recipe: Recipe): Promise<{ success: boolean }> {
    return request('/api/cooking/save', {
      method: 'POST',
      body: JSON.stringify({ recipe }),
    });
  },

  // Meal Planner
  async getMealPlan(): Promise<{ success: boolean; data: MealPlan }> {
    return request('/api/mealplans/current');
  },

  async generateMealPlan(payload: {
    dietaryStyle: string;
    calorieTarget: number;
    targetGoal?: string;
    allergies?: string[];
  }): Promise<{ success: boolean; data: MealPlan }> {
    return request('/api/mealplans/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async toggleGroceryItem(categoryName: string, itemName: string): Promise<any> {
    return request('/api/mealplans/toggle-grocery', {
      method: 'POST',
      body: JSON.stringify({ categoryName, itemName }),
    });
  },

  // Epics & Stats
  async getEpics(): Promise<{
    success: boolean;
    data: {
      totalEpics: number;
      totalTasks: number;
      completedTasks: number;
      progressPercentage: number;
      epics: Epic[];
    };
  }> {
    return request('/api/stats/epics');
  },

  async getOverviewStats(): Promise<{ success: boolean; data: any }> {
    return request('/api/stats/overview');
  },
};
