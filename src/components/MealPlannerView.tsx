import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Sparkles,
  Flame,
  Check,
  RefreshCw,
  ShoppingCart,
  Clock,
  Utensils,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  Zap,
} from 'lucide-react';
import { MealPlan, UserProfile } from '../types/foodverse.ts';
import { api } from '../services/api.ts';

interface MealPlannerViewProps {
  user: UserProfile | null;
  onProfileUpdated?: (user: UserProfile) => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({ user, onProfileUpdated }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [dietaryStyle, setDietaryStyle] = useState<string>(user?.dietaryGoal || 'Mediterranean');
  const [calorieTarget, setCalorieTarget] = useState<number>(user?.calorieTarget || 2100);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'groceries' | 'nutritionist'>('schedule');

  // Load initial plan
  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async () => {
    try {
      const res = await api.getMealPlan();
      if (res.success && res.data) {
        setMealPlan(res.data);
      }
    } catch (err) {
      console.error('Failed to load meal plan:', err);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateMealPlan({
        dietaryStyle,
        calorieTarget,
        targetGoal: 'Maximum Vitality & Metabolic Health',
        allergies: user?.allergies || [],
      });
      if (res.success && res.data) {
        setMealPlan(res.data);
        setSelectedDayIdx(0);
      }
    } catch (err) {
      console.error('Error generating meal plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleGrocery = async (categoryName: string, itemName: string) => {
    if (!mealPlan) return;
    try {
      // Optimistic update
      const updatedList = mealPlan.groceryList.map((cat) => {
        if (cat.category === categoryName) {
          return {
            ...cat,
            items: cat.items.map((it) =>
              it.name === itemName ? { ...it, checked: !it.checked } : it
            ),
          };
        }
        return cat;
      });
      setMealPlan({ ...mealPlan, groceryList: updatedList });

      await api.toggleGroceryItem(categoryName, itemName);
    } catch (err) {
      console.error('Failed to toggle grocery item:', err);
    }
  };

  const selectedDay = mealPlan?.days[selectedDayIdx];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Precision Nutrition Architect
            </span>
            <span className="text-xs text-slate-400">Epic 7 • Personalized 7-Day Meal Plans</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Adaptive 7-Day Meal Planner & Smart Grocery Engine
          </h2>
          <p className="text-sm text-slate-400">
            Tailor daily macronutrients, calorie targets, and dietary constraints to automatically formulate delicious weekly meal schedules.
          </p>
        </div>

        {/* Generate / Refresh Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing 7 Days...' : 'Generate New 7-Day Plan'}</span>
          </button>
        </div>
      </div>

      {/* Target Configurator Bar */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                Dietary Archetype
              </label>
              <select
                value={dietaryStyle}
                onChange={(e) => setDietaryStyle(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Mediterranean">Mediterranean Longevity</option>
                <option value="High Protein Athletic">High-Protein Athletic (40/35/25)</option>
                <option value="Ketogenic">Ketogenic (Low Carb, High Fat)</option>
                <option value="Plant-Based Vegan">Whole-Food Plant-Based</option>
                <option value="Diabetic Low-Glycemic">Diabetic Low-Glycemic Protocol</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                Daily Calorie Target
              </label>
              <select
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value={1600}>1,600 kcal (Deficit / Fat Loss)</option>
                <option value={1900}>1,900 kcal (Mild Deficit)</option>
                <option value={2200}>2,200 kcal (Maintenance)</option>
                <option value={2500}>2,500 kcal (Hypertrophy / Athletic)</option>
                <option value={2800}>2,800 kcal (High Endurance)</option>
              </select>
            </div>
          </div>

          {/* Section View Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>7-Day Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab('groceries')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'groceries'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Smart Grocery List</span>
            </button>
          </div>
        </div>
      </div>

      {mealPlan && (
        <div className="space-y-6">
          {activeTab === 'schedule' ? (
            <>
              {/* 7-Day Day Selector Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {mealPlan.days.map((day, idx) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedDayIdx === idx
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Day {day.dayNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{day.dayName}</h4>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{day.dailyTotalCalories} kcal</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Day View */}
              {selectedDay && (
                <div className="space-y-6">
                  {/* Day Target Summary Banner */}
                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {selectedDay.dayName} Nutrition Profile
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-300 font-medium">
                          Focus: {selectedDay.micronutrientFocus}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {mealPlan.title}
                      </h3>
                    </div>

                    {/* Macro Target Badges */}
                    <div className="flex items-center gap-2.5 font-mono text-xs shrink-0">
                      <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300">
                        {selectedDay.dailyTotalCalories} kcal
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300">
                        {selectedDay.macros.proteinGrams}g Protein
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-300">
                        {selectedDay.macros.carbsGrams}g Carbs
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-300">
                        {selectedDay.macros.fatGrams}g Fat
                      </span>
                    </div>
                  </div>

                  {/* 4 Meals of the Day Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDay.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {meal.mealType}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                              <Clock className="w-3 h-3" />
                              {meal.cookingTimeMinutes} mins
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white mb-1.5 leading-snug">
                            {meal.name}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            {meal.shortDescription}
                          </p>
                        </div>

                        <div>
                          {/* Ingredients */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {meal.keyIngredients.map((item, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          </div>

                          {/* Nutrition Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono">
                            <span className="text-amber-300 font-bold">{meal.calories} kcal</span>
                            <span className="text-emerald-400">{meal.protein}g P</span>
                            <span className="text-sky-400">{meal.carbs}g C</span>
                            <span className="text-rose-400">{meal.fat}g F</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Smart Grocery List View */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Consolidated Weekly Grocery Checklist</h3>
                    <p className="text-xs text-slate-400">
                      Organized by grocery aisles to streamline shopping and eliminate food waste.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/25">
                    {mealPlan.groceryList.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0)} / {mealPlan.groceryList.reduce((acc, cat) => acc + cat.items.length, 0)} Checked
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mealPlan.groceryList.map((category) => (
                    <div
                      key={category.category}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-slate-800">
                        {category.category}
                      </h4>
                      <div className="space-y-2">
                        {category.items.map((item) => (
                          <div
                            key={item.name}
                            onClick={() => toggleGrocery(category.category, item.name)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {item.checked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500 shrink-0" />
                              )}
                              <span
                                className={`font-medium ${
                                  item.checked ? 'line-through text-slate-500' : 'text-slate-200'
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                            <span className="text-slate-400 font-mono text-[11px] shrink-0">
                              {item.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
