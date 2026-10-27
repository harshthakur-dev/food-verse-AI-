import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Flame,
  CheckCircle,
  AlertCircle,
  Loader2,
  Tag,
  Zap,
  Info,
  Layers,
  ArrowRight,
  RefreshCw,
  Video,
} from 'lucide-react';
import { FoodScan } from '../types/foodverse.ts';
import { api } from '../services/api.ts';

interface FoodScannerViewProps {
  onScanComplete?: (scan: FoodScan) => void;
  recentScans: FoodScan[];
}

const SAMPLE_DISHES = [
  {
    name: 'Pan-Seared Wild Salmon & Quinoa Bowl',
    hint: 'Wild Salmon Quinoa Bowl with Asparagus',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Poached Egg Avocado Sourdough',
    hint: 'Poached Egg Sourdough with Smashed Avocado & Microgreens',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Superfood Acai & Berry Smoothie Bowl',
    hint: 'Superfood Acai & Berry Smoothie Bowl with Hemp Seeds',
    url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Charred Chicken & Mediterranean Medley',
    hint: 'Mediterranean Charred Chicken & Roasted Vegetable Medley',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Artisan Neapolitan Pizza with Basil',
    hint: 'Artisan Thin Crust Margherita Pizza with Fresh Mozzarella and Basil',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
  },
];

export const FoodScannerView: React.FC<FoodScannerViewProps> = ({ onScanComplete, recentScans }) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_DISHES[0].url);
  const [dishHint, setDishHint] = useState<string>(SAMPLE_DISHES[0].hint);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<FoodScan | null>(recentScans[0] || null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Could not access camera. Please check browser camera permissions or upload an image.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        setDishHint('Live Food Camera Capture');
        stopCamera();
        runAnalysis(dataUrl, 'Live Food Camera Capture');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        setDishHint(file.name.replace(/\.[^/.]+$/, ''));
        runAnalysis(base64, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imgData: string, hint: string) => {
    setIsAnalyzing(true);
    try {
      const res = await api.recognizeFood({
        imageBase64: imgData.startsWith('data:') ? imgData : undefined,
        imageUrl: !imgData.startsWith('data:') ? imgData : undefined,
        dishHint: hint,
      });
      if (res.success && res.data) {
        setCurrentResult(res.data);
        if (onScanComplete) {
          onScanComplete(res.data);
        }
      }
    } catch (err) {
      console.error('Error running food analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_DISHES[0]) => {
    if (isCameraActive) stopCamera();
    setSelectedImage(sample.url);
    setDishHint(sample.hint);
    runAnalysis(sample.url, sample.hint);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Multimodal Vision Engine
            </span>
            <span className="text-xs text-slate-400">Epic 2 & 3 • Nutrition AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Food Recognition & Precision Nutrition Scanner
          </h2>
          <p className="text-sm text-slate-400">
            Identify complex dishes, estimate portion gram weights, calculate macronutrients, glycemic index, and health scores.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload Image</span>
          </button>
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              <Camera className="w-4 h-4" />
              <span>Open Camera</span>
            </button>
          ) : (
            <button
              onClick={captureCameraFrame}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs animate-pulse"
            >
              <Video className="w-4 h-4" />
              <span>Capture & Analyze</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Dishes Picker */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Or Select a Curated Culinary Test Sample:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SAMPLE_DISHES.map((dish, i) => (
            <button
              key={i}
              onClick={() => handleSelectSample(dish)}
              className={`group flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                selectedImage === dish.url
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <img
                src={dish.url}
                alt={dish.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-800"
              />
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white line-clamp-2 leading-tight">
                {dish.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Display: Left Image Viewport, Right Nutritional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Live Image Viewport & Multimodal Bounding Overlay */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl aspect-4/3 flex items-center justify-center">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={selectedImage}
                alt="Selected Food Item"
                className="w-full h-full object-cover"
              />
            )}

            {/* Scanning Overlay Animation */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-sm font-bold text-white mt-4">Multimodal Vision Parsing...</p>
                <p className="text-xs text-slate-400 mt-1">Estimating portion weights & nutrient density</p>
              </div>
            )}

            {/* Bounding box badges simulating computer vision object detection */}
            {!isAnalyzing && currentResult && !isCameraActive && (
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                <span className="px-2 py-1 rounded bg-slate-950/80 backdrop-blur-md text-[11px] font-mono font-bold text-emerald-400 border border-emerald-500/40 shadow-lg">
                  CV: {currentResult.dishName}
                </span>
                <span className="px-2 py-1 rounded bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-amber-300 border border-amber-500/30">
                  {currentResult.servingSize}
                </span>
              </div>
            )}

            {isCameraActive && (
              <div className="absolute bottom-3 inset-x-3 flex justify-center z-10">
                <button
                  onClick={captureCameraFrame}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo for Nutrition</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Rescan / Trigger Button */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Powered by Gemini 3.8 Flash Vision</span>
            <button
              onClick={() => runAnalysis(selectedImage, dishHint)}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Re-analyze Dish</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): Nutritional Breakdown & Health Diagnostics */}
        <div className="lg:col-span-7 space-y-6">
          {currentResult ? (
            <div className="space-y-6">
              {/* Dish Header & Health Grade Score */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {currentResult.category}
                      </span>
                      <span className="text-xs text-slate-400">{currentResult.cuisine} Cuisine</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {currentResult.dishName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Estimated Portion: <span className="text-slate-200 font-medium">{currentResult.servingSize}</span>
                    </p>
                  </div>

                  {/* Health Score Pill & Letter Grade */}
                  <div className="flex items-center gap-3 shrink-0 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-2xl text-slate-950 shadow-lg shadow-emerald-500/20">
                      {currentResult.healthGrade}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase">Health Score</div>
                      <div className="text-lg font-black text-emerald-400">
                        {currentResult.healthScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Macronutrient Metric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400">Calories</span>
                    <div className="text-xl font-black text-amber-400 mt-0.5 font-mono">
                      {currentResult.nutritionalBreakdown.calories}
                    </div>
                    <span className="text-[10px] text-slate-500">kcal total</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400">Protein</span>
                    <div className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
                      {currentResult.nutritionalBreakdown.proteinGrams}g
                    </div>
                    <span className="text-[10px] text-slate-500">amino acids</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400">Net Carbs</span>
                    <div className="text-xl font-black text-sky-400 mt-0.5 font-mono">
                      {currentResult.nutritionalBreakdown.carbsGrams}g
                    </div>
                    <span className="text-[10px] text-slate-500">{currentResult.nutritionalBreakdown.fiberGrams}g fiber</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400">Fats</span>
                    <div className="text-xl font-black text-rose-400 mt-0.5 font-mono">
                      {currentResult.nutritionalBreakdown.fatGrams}g
                    </div>
                    <span className="text-[10px] text-slate-500">lipids</span>
                  </div>
                </div>

                {/* Glycemic Index & Secondary Indicators */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Glycemic Index:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        currentResult.nutritionalBreakdown.glycemicIndex === 'Low'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : currentResult.nutritionalBreakdown.glycemicIndex === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {currentResult.nutritionalBreakdown.glycemicIndex} Load
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                    <span>Sodium: <strong className="text-slate-200">{currentResult.nutritionalBreakdown.sodiumMg}mg</strong></span>
                    <span>Sugar: <strong className="text-slate-200">{currentResult.nutritionalBreakdown.sugarGrams}g</strong></span>
                  </div>
                </div>
              </div>

              {/* Detected Ingredients with Vision Confidence */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Detected Ingredients & Portion Estimates</span>
                  </h4>
                  <span className="text-xs text-slate-400">Confidence Model</span>
                </div>

                <div className="space-y-2.5">
                  {currentResult.detectedIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono">{item.estimatedWeight}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergens & Dietary Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Dietary Classifications
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentResult.dietaryTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Allergen Warnings
                  </span>
                  {currentResult.allergens.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {currentResult.allergens.map((allergen, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          <span>{allergen}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>No major common allergens detected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-950/20">
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Dietitian Insights</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                  {currentResult.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-emerald-300 font-medium">
                  <strong>Recommendation:</strong> {currentResult.recommendation}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400">
              <Camera className="w-10 h-10 text-slate-600 mb-3" />
              <p className="font-semibold text-sm">Select or upload a food item to initiate multimodal scan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
