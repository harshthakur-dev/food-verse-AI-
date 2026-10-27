import React from 'react';
import {
  Sparkles,
  Camera,
  Apple,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  ArrowRight,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HeartPulse,
} from 'lucide-react';
import { ActiveTab, FoodScan, FreshnessReport, HygieneInspectionReport, UserProfile } from '../types/foodverse.ts';

interface OverviewDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  recentScans: FoodScan[];
  recentFreshness: FreshnessReport[];
  recentAudits: HygieneInspectionReport[];
  user: UserProfile | null;
  onOpenVoice: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  setActiveTab,
  recentScans,
  recentFreshness,
  recentAudits,
  user,
  onOpenVoice,
}) => {
  const latestAudit = recentAudits[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Next-Generation Multimodal Food Intelligence Agent</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Real-Time Vision, Freshness & Culinary Safety in One Unified Platform
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Empowering households, restaurants, and nutritionists with computer vision food identification,
            optical perishables freshness detection, commercial kitchen CCTV hygiene auditing, and adaptive AI cooking.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('food-scanner')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-102"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Food Dish</span>
            </button>
            <button
              onClick={() => setActiveTab('freshness')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 transition-all"
            >
              <Apple className="w-4 h-4 text-emerald-400" />
              <span>Check Freshness</span>
            </button>
            <button
              onClick={() => setActiveTab('hygiene')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Kitchen Safety Audit</span>
            </button>
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold text-sm border border-amber-500/30 transition-all"
            >
              <ChefHat className="w-4 h-4" />
              <span>Ask Voice Chef</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Food Scans Analyzed
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{recentScans.length}</span>
            <span className="text-xs text-emerald-400 font-medium">Vision Verified</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Calorie, macro & allergen breakdown</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Perishables Tracked
            </span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Apple className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{recentFreshness.length}</span>
            <span className="text-xs text-teal-400 font-medium">Optical Grading</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Active shelf life countdowns</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hygiene Score Avg
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {latestAudit ? `${latestAudit.overallScore}%` : '94%'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Grade A HACCP</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Gloves & cross-contact audited</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Target Nutrition
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{user?.calorieTarget || 2200}</span>
            <span className="text-xs text-slate-400 font-medium">kcal / day</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">{user?.dietaryGoal || 'High Protein & Lean Athleticism'}</p>
        </div>
      </div>

      {/* Core Grid: Visual Feeds & Actionable Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide): Recent Food Scans & Freshness Ticker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Food Vision Scans */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recent Multimodal Food Scans</h3>
                  <p className="text-xs text-slate-400">Computer vision dish detection & macro breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('food-scanner')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Open Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentScans.slice(0, 3).map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => setActiveTab('food-scanner')}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    {scan.imageUrl ? (
                      <img
                        src={scan.imageUrl}
                        alt={scan.dishName}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-800 group-hover:scale-105 transition-transform shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <Camera className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                          {scan.dishName}
                        </h4>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {scan.healthGrade} Grade ({scan.healthScore}pts)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{scan.category} • {scan.cuisine}</p>
                    </div>
                  </div>

                  {/* Macro Pills */}
                  <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                    <span className="px-2 py-1 rounded bg-slate-800/80 text-amber-300">
                      {scan.nutritionalBreakdown.calories} kcal
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-800/80 text-emerald-300">
                      {scan.nutritionalBreakdown.proteinGrams}g P
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-800/80 text-sky-300">
                      {scan.nutritionalBreakdown.carbsGrams}g C
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-800/80 text-rose-300">
                      {scan.nutritionalBreakdown.fatGrams}g F
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Freshness & Perishables Radar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/15 text-teal-400">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Perishable Freshness & Spoilage Monitor</h3>
                  <p className="text-xs text-slate-400">Optical discoloration, moisture & shelf life forecast</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('freshness')}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
              >
                <span>Inspect Item</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentFreshness.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('freshness')}
                  className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 hover:border-teal-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{item.itemName}</h4>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Fresh'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : item.status === 'Moderately Fresh'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Freshness Index:</span>
                      <span className="font-mono font-semibold text-slate-200">{item.freshnessScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.freshnessScore > 80
                            ? 'bg-emerald-500'
                            : item.freshnessScore > 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.freshnessScore}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {item.estimatedShelfLifeDays} days remaining
                      </span>
                      <span className="font-medium text-slate-300 truncate max-w-[150px]">
                        {item.safetyVerdict}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col wide): Kitchen Hygiene & Epics Status */}
        <div className="space-y-6">
          {/* Kitchen Hygiene Monitor Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Kitchen CCTV Safety</h3>
                  <p className="text-[11px] text-slate-400">HACCP & PPE compliance</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('hygiene')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Audits →
              </button>
            </div>

            {latestAudit && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">{latestAudit.stationName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {latestAudit.letterGrade}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Gloves: {latestAudit.complianceBreakdown.gloveCompliancePercent}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Hair-Cap: {latestAudit.complianceBreakdown.hairCapCompliancePercent}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Surfaces: {latestAudit.complianceBreakdown.surfaceCleanlinessScore}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Cross-Contact: {latestAudit.complianceBreakdown.crossContaminationScore}%</span>
                    </div>
                  </div>
                </div>

                {latestAudit.detectedViolations.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Active Advisory:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {latestAudit.detectedViolations[0].description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Epics & Technical Architecture Hub Card */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Project Specs & Epics</h3>
                  <p className="text-[11px] text-slate-400">9 Epics • 16 Tasks Active</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('architecture')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View →
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Fullstack multimodal system comprising ReactJS frontend, Node/Express & Python FastAPI AI endpoints,
              and Gemini 3.8 Flash multimodal reasoning engine.
            </p>

            <div className="space-y-2 text-xs font-medium text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>Frontend Client</span>
                <span className="font-mono text-[11px] text-emerald-400">React 19 + Tailwind</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>Backend API Bridge</span>
                <span className="font-mono text-[11px] text-amber-400">Express + tsx Node</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>AI Services</span>
                <span className="font-mono text-[11px] text-indigo-400">Gemini 3.8 Flash + FastAPI</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('architecture')}
              className="w-full mt-4 py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition-all text-center"
            >
              Inspect 9 Epics & Subtasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
