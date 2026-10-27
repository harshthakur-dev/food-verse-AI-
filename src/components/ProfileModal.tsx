import React, { useState } from 'react';
import { X, Check, User, Target, Flame, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types/foodverse.ts';
import { api } from '../services/api.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserUpdated: (user: UserProfile) => void;
}

const ALLERGEN_OPTIONS = ['Peanuts', 'Tree Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [name, setName] = useState<string>(user?.name || 'Chef Harsh Thakur');
  const [dietaryGoal, setDietaryGoal] = useState<string>(
    user?.dietaryGoal || 'High Protein & Lean Athleticism'
  );
  const [calorieTarget, setCalorieTarget] = useState<number>(user?.calorieTarget || 2200);
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || ['Peanuts']);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleAllergen = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProfile({
        name,
        dietaryGoal,
        calorieTarget,
        allergies,
      });
      if (res.success && res.user) {
        onUserUpdated(res.user);
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Culinary & Nutrition Profile</h3>
              <p className="text-xs text-slate-400">Personalize AI dietary recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">User Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Dietary Target Goal</label>
            <select
              value={dietaryGoal}
              onChange={(e) => setDietaryGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="High Protein & Lean Athleticism">High Protein & Lean Athleticism</option>
              <option value="Mediterranean Longevity">Mediterranean Longevity</option>
              <option value="Ketogenic Metabolic Reset">Ketogenic Metabolic Reset</option>
              <option value="Plant-Based Vegan">Whole-Food Plant-Based</option>
              <option value="Diabetic Glucose Control">Diabetic Glucose Control</option>
              <option value="Weight Loss Calorie Deficit">Weight Loss Calorie Deficit</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Target Daily Calories (kcal)
            </label>
            <input
              type="number"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(Number(e.target.value))}
              min={1200}
              max={4500}
              step={50}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-2">
              Allergens & Dietary Exclusions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGEN_OPTIONS.map((item) => {
                const isSelected = allergies.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleAllergen(item)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item} {isSelected ? '✕' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>{isSaving ? 'Updating...' : 'Save Profile'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
