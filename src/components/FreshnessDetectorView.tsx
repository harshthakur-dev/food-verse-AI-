import React, { useState, useRef } from 'react';
import {
  Apple,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Thermometer,
  RefreshCw,
  PackageCheck,
  Video,
} from 'lucide-react';
import { FreshnessReport, FreshnessStatus } from '../types/foodverse.ts';
import { api } from '../services/api.ts';

interface FreshnessDetectorViewProps {
  onReportGenerated?: (report: FreshnessReport) => void;
  recentFreshness: FreshnessReport[];
}

const FRESHNESS_SAMPLES = [
  {
    name: 'Pristine Hass Avocado',
    category: 'Produce',
    status: 'Fresh',
    hint: 'Pristine Hass Avocado in peak freshness',
    url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Organic Sweet Strawberries',
    category: 'Berries',
    status: 'Moderately Fresh',
    hint: 'Ripe Strawberries with early softening',
    url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Overripe Spoiled Produce with Mold',
    category: 'Vegetables',
    status: 'Spoiled',
    hint: 'Spoiled bell pepper with visible mold hyphae and tissue collapse',
    url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Wild Atlantic Salmon Fillet',
    category: 'Seafood',
    status: 'Fresh',
    hint: 'Fresh wild salmon fillet firm flesh and translucent sheen',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  },
];

export const FreshnessDetectorView: React.FC<FreshnessDetectorViewProps> = ({
  onReportGenerated,
  recentFreshness,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(FRESHNESS_SAMPLES[0].url);
  const [itemHint, setItemHint] = useState<string>(FRESHNESS_SAMPLES[0].hint);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<FreshnessReport | null>(recentFreshness[0] || null);
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
      console.error('Camera error:', err);
      alert('Could not open camera. Please check permissions or upload a photo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        setItemHint('Captured Perishable Item');
        stopCamera();
        runEvaluation(dataUrl, 'Captured Perishable Item');
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
        setItemHint(file.name.replace(/\.[^/.]+$/, ''));
        runEvaluation(base64, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const runEvaluation = async (imgData: string, hint: string) => {
    setIsEvaluating(true);
    try {
      const res = await api.evaluateFreshness({
        imageBase64: imgData.startsWith('data:') ? imgData : undefined,
        imageUrl: !imgData.startsWith('data:') ? imgData : undefined,
        itemHint: hint,
      });
      if (res.success && res.data) {
        setCurrentReport(res.data);
        if (onReportGenerated) {
          onReportGenerated(res.data);
        }
      }
    } catch (err) {
      console.error('Freshness evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectSample = (sample: typeof FRESHNESS_SAMPLES[0]) => {
    if (isCameraActive) stopCamera();
    setSelectedImage(sample.url);
    setItemHint(sample.hint);
    runEvaluation(sample.url, sample.hint);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              Optical Perishable Inspector
            </span>
            <span className="text-xs text-slate-400">Epic 4 • Food Freshness & Waste Reduction</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Food Freshness & Spoilage Optical Radar
          </h2>
          <p className="text-sm text-slate-400">
            Analyze color variances, surface texture collapse, moisture imbalances, and micro-spores to classify items as Fresh, Moderately Fresh, or Spoiled.
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
            <Upload className="w-4 h-4 text-teal-400" />
            <span>Upload Perishable</span>
          </button>
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20"
            >
              <Camera className="w-4 h-4" />
              <span>Camera Scan</span>
            </button>
          ) : (
            <button
              onClick={capturePhoto}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs animate-pulse"
            >
              <Video className="w-4 h-4" />
              <span>Capture Perishable</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Perishables Samples */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Or Select Perishable Specimen:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FRESHNESS_SAMPLES.map((sample, i) => (
            <button
              key={i}
              onClick={() => handleSelectSample(sample)}
              className={`group flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                selectedImage === sample.url
                  ? 'border-teal-500 bg-teal-500/10 shadow-sm'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-800"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">
                  {sample.name}
                </h4>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    sample.status === 'Fresh'
                      ? 'text-emerald-400'
                      : sample.status === 'Moderately Fresh'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {sample.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Viewport (5 cols) */}
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
                alt="Perishable Item"
                className="w-full h-full object-cover"
              />
            )}

            {isEvaluating && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin" />
                  <Apple className="w-6 h-6 text-teal-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-sm font-bold text-white mt-4">Optical Spectrum Scanning...</p>
                <p className="text-xs text-slate-400 mt-1">Analyzing tissue turgor & browning indices</p>
              </div>
            )}

            {!isEvaluating && currentReport && !isCameraActive && (
              <div className="absolute top-3 left-3 z-10">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-lg ${
                    currentReport.status === 'Fresh'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : currentReport.status === 'Moderately Fresh'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                  }`}
                >
                  Status: {currentReport.status}
                </span>
              </div>
            )}

            {isCameraActive && (
              <div className="absolute bottom-3 inset-x-3 flex justify-center z-10">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-teal-500/30 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Perishable</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Perishable Quality Index (PQI)</span>
            <button
              onClick={() => runEvaluation(selectedImage, itemHint)}
              disabled={isEvaluating}
              className="flex items-center gap-1.5 font-semibold text-teal-400 hover:text-teal-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>Rescan Quality</span>
            </button>
          </div>
        </div>

        {/* Right Inspection Diagnostics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {currentReport ? (
            <div className="space-y-6">
              {/* Verdict Banner */}
              <div
                className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  currentReport.status === 'Fresh'
                    ? 'border-emerald-500/30 bg-emerald-950/15'
                    : currentReport.status === 'Moderately Fresh'
                    ? 'border-amber-500/30 bg-amber-950/15'
                    : 'border-rose-500/30 bg-rose-950/15'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">{currentReport.category}</span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      {currentReport.itemName}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-slate-300">Verdict:</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          currentReport.status === 'Fresh'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : currentReport.status === 'Moderately Fresh'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {currentReport.safetyVerdict}
                      </span>
                    </div>
                  </div>

                  {/* Days remaining badge */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Clock className="w-8 h-8 text-teal-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated Shelf Life</div>
                      <div className="text-xl font-black text-white font-mono">
                        {currentReport.estimatedShelfLifeDays} <span className="text-xs text-slate-400 font-normal">days left</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Freshness Integrity Index</span>
                    <span className="font-mono font-bold text-white">{currentReport.freshnessScore}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentReport.freshnessScore > 80
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : currentReport.freshnessScore > 50
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-600 to-red-400'
                      }`}
                      style={{ width: `${currentReport.freshnessScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4 Sensory Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Color Integrity</span>
                  <div className="text-lg font-black text-teal-300 font-mono">
                    {currentReport.sensoryIndicators.colorIntegrity}%
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-teal-400 h-full rounded-full"
                      style={{ width: `${currentReport.sensoryIndicators.colorIntegrity}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Surface Firmness</span>
                  <div className="text-lg font-black text-emerald-300 font-mono">
                    {currentReport.sensoryIndicators.surfaceTexture}%
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${currentReport.sensoryIndicators.surfaceTexture}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Moisture Balance</span>
                  <div className="text-lg font-black text-sky-300 font-mono">
                    {currentReport.sensoryIndicators.moistureBalance}%
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full"
                      style={{ width: `${currentReport.sensoryIndicators.moistureBalance}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Microbial Hazard</span>
                  <div
                    className={`text-lg font-black font-mono ${
                      currentReport.sensoryIndicators.microbialRisk > 50 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {currentReport.sensoryIndicators.microbialRisk}%
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        currentReport.sensoryIndicators.microbialRisk > 50 ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${currentReport.sensoryIndicators.microbialRisk}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Observed Optical Markers */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5 text-teal-400" />
                  <span>Observed Surface & Morphological Markers</span>
                </h4>
                <div className="space-y-2">
                  {currentReport.visualMarkers.map((marker, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      <span>{marker}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Guidance & Storage Instructions */}
              <div className="p-5 rounded-2xl border border-teal-500/25 bg-teal-950/20">
                <div className="flex items-center gap-2 mb-2 text-teal-400 font-bold text-sm">
                  <PackageCheck className="w-4 h-4" />
                  <span>Culinary Preservation & Waste Prevention Guidance</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed mb-3">
                  {currentReport.actionableGuidance}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-teal-500/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
                    Recommended Storage Strategy:
                  </span>
                  {currentReport.storageOptimizations.map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400">
              <Apple className="w-10 h-10 text-slate-600 mb-3" />
              <p className="font-semibold text-sm">Select a perishable specimen to inspect freshness index</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
