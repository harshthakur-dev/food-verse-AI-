import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Sparkles,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Lightbulb,
  MessageSquare,
  Send,
  HelpCircle,
  Bookmark,
} from 'lucide-react';
import { Recipe, CookingStep } from '../types/foodverse.ts';
import { api } from '../services/api.ts';

interface SmartCookingViewProps {
  onRecipeSaved?: (recipe: Recipe) => void;
}

const DEFAULT_PANTRY = ['Eggs', 'Tomatoes', 'Garlic', 'Olive Oil', 'Spinach', 'Parmesan'];

export const SmartCookingView: React.FC<SmartCookingViewProps> = ({ onRecipeSaved }) => {
  // Pantry matcher state
  const [pantryIngredients, setPantryIngredients] = useState<string[]>(DEFAULT_PANTRY);
  const [ingredientInput, setIngredientInput] = useState<string>('');
  const [dietaryGoal, setDietaryGoal] = useState<string>('High-Protein Balanced');
  const [maxMinutes, setMaxMinutes] = useState<number>(25);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  // Guided cooking runner state
  const [isCookingMode, setIsCookingMode] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [voiceVoiceMuted, setVoiceMuted] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Chef Q&A chat state
  const [chefQuestions, setChefQuestions] = useState<Array<{ q: string; a: string }>>([
    {
      q: 'How do I know when the sauce has reduced enough?',
      a: 'Run a wooden spoon across the bottom of the skillet. If the line holds clear for 2 seconds before the sauce flows back, your reduction is thick and glossy!',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAskingChef, setIsAskingChef] = useState<boolean>(false);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      speakText('Step timer complete! Please check your pan.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Voice speech synthesis helper
  const speakText = (text: string) => {
    if (voiceVoiceMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim() && !pantryIngredients.includes(ingredientInput.trim())) {
      setPantryIngredients([...pantryIngredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    setPantryIngredients(pantryIngredients.filter((i) => i !== ing));
  };

  const generateRecipeFromPantry = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateRecipe({
        ingredients: pantryIngredients,
        dietaryPreference: dietaryGoal,
        targetTimeMinutes: maxMinutes,
      });
      if (res.success && res.data) {
        setRecipe(res.data);
        setCurrentStepIdx(0);
        setIsCookingMode(false);
      }
    } catch (err) {
      console.error('Recipe generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const startCookingStep = (stepIdx: number) => {
    setCurrentStepIdx(stepIdx);
    if (!recipe) return;
    const step = recipe.steps[stepIdx];
    if (step.durationSeconds) {
      setTimerSecondsLeft(step.durationSeconds);
      setIsTimerRunning(true);
    } else {
      setTimerSecondsLeft(0);
      setIsTimerRunning(false);
    }
    speakText(`Step ${step.stepNumber}: ${step.audioVoiceGuidance || step.instruction}`);
  };

  const handleAskChef = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userQ = chatInput.trim();
    setChatInput('');
    setIsAskingChef(true);

    try {
      const res = await api.askChef({
        query: userQ,
        recipeContext: recipe ? `${recipe.title} - Step ${currentStepIdx + 1}` : undefined,
      });
      if (res.success && res.data) {
        setChefQuestions((prev) => [...prev, { q: userQ, a: res.data.answer }]);
        speakText(res.data.answer);
      }
    } catch (err) {
      console.error('Chef question error:', err);
    } finally {
      setIsAskingChef(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    try {
      await api.saveRecipe(recipe);
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2500);
      if (onRecipeSaved) onRecipeSaved(recipe);
    } catch (err) {
      console.error('Save recipe error:', err);
    }
  };

  // Generate initial recipe if none
  useEffect(() => {
    if (!recipe) {
      generateRecipeFromPantry();
    }
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Interactive AI Chef
            </span>
            <span className="text-xs text-slate-400">Epic 6 & 8 • Smart Cooking & Voice Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pantry-to-Plate Recipe Generator & Guided Cooking Assistant
          </h2>
          <p className="text-sm text-slate-400">
            Tell the AI what is in your fridge to invent tailored gourmet recipes, with hands-free voice guidance and synced cooking timers.
          </p>
        </div>

        {/* Audio Mute & Save Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVoiceMuted(!voiceVoiceMuted)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              voiceVoiceMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {voiceVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{voiceVoiceMuted ? 'Voice Muted' : 'Voice Active'}</span>
          </button>

          {recipe && (
            <button
              onClick={handleSaveRecipe}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-all"
            >
              {savedNotification ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-amber-400" />}
              <span>{savedNotification ? 'Saved!' : 'Save Recipe'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Pantry Scanner & Ingredient Selector Bar */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ChefHat className="w-4 h-4 text-emerald-400" />
            <span>Fridge & Pantry Matcher ("Cook with What I Have")</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <select
              value={dietaryGoal}
              onChange={(e) => setDietaryGoal(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="High-Protein Balanced">High-Protein Balanced</option>
              <option value="Ketogenic Low-Carb">Ketogenic Low-Carb</option>
              <option value="Mediterranean Diet">Mediterranean Diet</option>
              <option value="Plant-Based Vegan">Plant-Based Vegan</option>
              <option value="Gluten-Free Clean">Gluten-Free Clean</option>
            </select>

            <select
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value={15}>&lt; 15 mins (Speed Meal)</option>
              <option value={25}>&lt; 25 mins (Standard)</option>
              <option value={45}>&lt; 45 mins (Gourmet)</option>
            </select>
          </div>
        </div>

        {/* Ingredient Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {pantryIngredients.map((ing) => (
            <span
              key={ing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium"
            >
              <span>{ing}</span>
              <button
                onClick={() => handleRemoveIngredient(ing)}
                className="text-slate-500 hover:text-rose-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Add input */}
          <div className="inline-flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Add ingredient..."
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-36"
            />
            <button
              onClick={handleAddIngredient}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={generateRecipeFromPantry}
            disabled={isGenerating || pantryIngredients.length === 0}
            className="ml-auto px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Inventing Recipe...' : 'Invent Recipe'}</span>
          </button>
        </div>
      </div>

      {/* Main Recipe Section */}
      {recipe && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Recipe Details & Step-by-Step Cooking Mode */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Quick Stats */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {recipe.cuisine}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Difficulty: {recipe.difficulty}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{recipe.title}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{recipe.summary}</p>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins total</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{recipe.nutritionalEstimatePerServing.calories} kcal / serving</span>
                  </div>
                </div>
              </div>

              {/* Mode Toggle Button */}
              <div className="flex items-center justify-between mt-4 pt-2">
                <span className="text-xs font-semibold text-slate-400">
                  {recipe.steps.length} Preparation Steps Ready
                </span>
                <button
                  onClick={() => {
                    setIsCookingMode(!isCookingMode);
                    if (!isCookingMode) startCookingStep(0);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isCookingMode
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isCookingMode ? 'Exit Cooking Mode' : 'Start Cooking Mode'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Cooking Mode Runner */}
            {isCookingMode && recipe.steps[currentStepIdx] ? (
              <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      {currentStepIdx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Step {currentStepIdx + 1} of {recipe.steps.length}
                    </span>
                  </div>

                  {/* Step Timer Controller */}
                  {recipe.steps[currentStepIdx].durationSeconds ? (
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-base font-black text-amber-300">
                        {formatTimer(timerSecondsLeft)}
                      </span>
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="p-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 ml-1"
                      >
                        {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSecondsLeft(recipe.steps[currentStepIdx].durationSeconds || 0);
                        }}
                        className="p-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Instruction Body */}
                <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                  {recipe.steps[currentStepIdx].instruction}
                </p>

                {/* Visual Cue & Pro Tip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {recipe.steps[currentStepIdx].visualCue && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <span className="font-bold text-amber-400 block mb-1">Visual & Audio Cue:</span>
                      <p className="text-slate-300">{recipe.steps[currentStepIdx].visualCue}</p>
                    </div>
                  )}

                  {recipe.steps[currentStepIdx].proTip && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <span className="font-bold text-emerald-400 block mb-1">Chef Secret:</span>
                      <p className="text-slate-300">{recipe.steps[currentStepIdx].proTip}</p>
                    </div>
                  )}
                </div>

                {/* Step Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={() => startCookingStep(Math.max(0, currentStepIdx - 1))}
                    disabled={currentStepIdx === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-40"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Step</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {recipe.steps.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx === currentStepIdx
                            ? 'bg-emerald-400 w-5'
                            : idx < currentStepIdx
                            ? 'bg-emerald-600'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {currentStepIdx < recipe.steps.length - 1 ? (
                    <button
                      onClick={() => startCookingStep(currentStepIdx + 1)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsCookingMode(false);
                        speakText('Congratulations, your culinary creation is complete! Bon Appetit.');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 text-xs font-extrabold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Dish Complete!</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Standard All Steps List View */
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Cooking Method & Instructions
                </h4>

                <div className="space-y-3.5">
                  {recipe.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      onClick={() => {
                        setIsCookingMode(true);
                        startCookingStep(step.stepNumber - 1);
                      }}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/40 hover:bg-slate-950 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
                          {step.stepNumber}
                        </span>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {step.instruction}
                          </p>
                          {step.proTip && (
                            <p className="text-[11px] text-emerald-400/90 italic">
                              Tip: {step.proTip}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Ingredients, Substitutions & Conversational Chef Q&A */}
          <div className="lg:col-span-5 space-y-6">
            {/* Ingredients Required */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
              <h4 className="text-sm font-bold text-white mb-3">Matched Pantry Ingredients</h4>
              <div className="space-y-2">
                {recipe.matchedIngredients.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 text-xs text-slate-200 border border-slate-800"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {recipe.missingPantryPicks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Standard Pantry Staples Needed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.missingPantryPicks.map((pick, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono"
                      >
                        {pick}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Smart Substitutions Matrix */}
            {recipe.substitutions.length > 0 && (
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Smart Ingredient Substitutions</span>
                </div>
                <div className="space-y-2">
                  {recipe.substitutions.map((sub, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="text-slate-400 line-through">{sub.original}</span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                        <span className="text-emerald-300">{sub.substitute}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{sub.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-Time Chef Q&A Chat */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Culinary Master Chef Live Q&A</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 no-scrollbar text-xs">
                {chefQuestions.map((qa, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 text-slate-100 ml-4 font-medium">
                      {qa.q}
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/25 text-emerald-200 mr-4 leading-relaxed">
                      <strong>Chef AI:</strong> {qa.a}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAskChef} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Ask chef about heat, timing, wine pairing..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isAskingChef || !chatInput.trim()}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
