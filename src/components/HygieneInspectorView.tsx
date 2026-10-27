import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Video,
  Upload,
  RefreshCw,
  FileText,
  Clock,
  Sparkles,
  Download,
  Eye,
  Check,
} from 'lucide-react';
import { HygieneInspectionReport } from '../types/foodverse.ts';
import { api } from '../services/api.ts';

interface HygieneInspectorViewProps {
  onAuditComplete?: (report: HygieneInspectionReport) => void;
  recentAudits: HygieneInspectionReport[];
}

const KITCHEN_SCENARIOS = [
  {
    name: 'Executive Saute & Pass Station (Grade A)',
    hint: 'Gourmet Cold Larder & Hot Pass #1',
    description: 'Clean commercial stainless steel line, staff in full hair-nets and nitrile gloves.',
    videoPoster: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    expectedGrade: 'Grade A',
  },
  {
    name: 'Butchery & Cold Prep Line (Cross-Contact Hazard)',
    hint: 'Butchery & Cold Prep Line #3 with violation hazard',
    description: 'High-risk raw poultry station with cutting board segregation breach.',
    videoPoster: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80',
    expectedGrade: 'Critical Failure',
  },
  {
    name: 'Pastry & Dessert Plating Bench',
    hint: 'Patisserie assembly station',
    description: 'Dry ingredient staging, high sanitation compliance with minor glove change reminder.',
    videoPoster: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    expectedGrade: 'Grade A',
  },
];

export const HygieneInspectorView: React.FC<HygieneInspectorViewProps> = ({
  onAuditComplete,
  recentAudits,
}) => {
  const [selectedScenario, setSelectedScenario] = useState(KITCHEN_SCENARIOS[0]);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [currentAudit, setCurrentAudit] = useState<HygieneInspectionReport | null>(recentAudits[0] || null);
  const [resolvedViolations, setResolvedViolations] = useState<string[]>([]);
  const [reportExported, setReportExported] = useState<boolean>(false);

  const runAudit = async (scenario: typeof KITCHEN_SCENARIOS[0]) => {
    setIsAuditing(true);
    setSelectedScenario(scenario);
    try {
      const res = await api.inspectHygiene({
        stationHint: scenario.hint,
      });
      if (res.success && res.data) {
        setCurrentAudit(res.data);
        setResolvedViolations([]);
        if (onAuditComplete) {
          onAuditComplete(res.data);
        }
      }
    } catch (err) {
      console.error('Hygiene audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const toggleViolationResolved = (id: string) => {
    setResolvedViolations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportReport = () => {
    setReportExported(true);
    setTimeout(() => setReportExported(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              CCTV AI Inspector
            </span>
            <span className="text-xs text-slate-400">Epic 5 • Commercial Food Safety & HACCP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Restaurant & Kitchen Hygiene Video Monitor
          </h2>
          <p className="text-sm text-slate-400">
            Continuously evaluate kitchen video frames for glove compliance, hair-cap restraints, cross-contamination risks, and countertop sanitation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => runAudit(selectedScenario)}
            disabled={isAuditing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>Run Real-Time Audit</span>
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-all"
          >
            {reportExported ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-amber-400" />}
            <span>{reportExported ? 'Audit Exported!' : 'Export HACCP PDF'}</span>
          </button>
        </div>
      </div>

      {/* Preset Camera Feed Scenario Selector */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Select Kitchen CCTV Video Feed:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {KITCHEN_SCENARIOS.map((sc, i) => (
            <button
              key={i}
              onClick={() => runAudit(sc)}
              className={`group flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                selectedScenario.name === sc.name
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <img
                src={sc.videoPoster}
                alt={sc.name}
                className="w-16 h-14 rounded-lg object-cover shrink-0 border border-slate-800"
              />
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">
                    {sc.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {sc.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Video Feed Frame Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl aspect-16/10 flex items-center justify-center">
            <img
              src={selectedScenario.videoPoster}
              alt="Kitchen Feed"
              className="w-full h-full object-cover brightness-90"
            />

            {/* CCTV Scan Line overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />

            {/* Video Feed Header Badges */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-emerald-400 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE FEED • CAM 04</span>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-slate-800">
                1080p 30FPS • HACCP AI
              </span>
            </div>

            {/* Loading Audit State */}
            {isAuditing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                  <ShieldCheck className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-sm font-bold text-white mt-4">Auditing Kitchen Video Feed...</p>
                <p className="text-xs text-slate-400 mt-1">Detecting PPE restraints, cutting boards & food cross-contact</p>
              </div>
            )}

            {/* Visual Bounding Overlay for Active Violations */}
            {!isAuditing && currentAudit && currentAudit.detectedViolations.length > 0 && (
              <div className="absolute bottom-3 inset-x-3 z-10">
                <div className="p-2.5 rounded-lg bg-rose-950/90 backdrop-blur-md border border-rose-500/40 text-xs flex items-center justify-between text-rose-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-bold">
                      {currentAudit.detectedViolations[0].category.replace('_', ' ')}: {currentAudit.detectedViolations[0].locationInFrame}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-rose-900/60 px-1.5 py-0.5 rounded text-rose-300">
                    {currentAudit.detectedViolations[0].timestamp}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Station Under Audit:</span>
              <span className="font-mono text-amber-400">{currentAudit?.stationName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>HACCP Compliance:</span>
              <span
                className={`font-bold ${
                  currentAudit?.haccpCertificationStatus === 'PASSED'
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {currentAudit?.haccpCertificationStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Compliance Diagnostics & Violations Action Plan */}
        <div className="lg:col-span-7 space-y-6">
          {currentAudit ? (
            <div className="space-y-6">
              {/* Hygiene Score Overview Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Inspection Result</span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      {currentAudit.stationName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Audited on {new Date(currentAudit.inspectionTimestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Letter Grade Badge */}
                  <div className="flex items-center gap-3 shrink-0 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-slate-950 shadow-lg ${
                        currentAudit.overallScore >= 90
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : currentAudit.overallScore >= 75
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                          : 'bg-gradient-to-br from-rose-500 to-red-600'
                      }`}
                    >
                      {currentAudit.letterGrade === 'Critical Failure' ? 'F' : currentAudit.letterGrade.split(' ')[1] || 'A'}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Hygiene Score</div>
                      <div className="text-xl font-black text-white font-mono">
                        {currentAudit.overallScore}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Compliance Sub-Meters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Glove Usage</span>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      {currentAudit.complianceBreakdown.gloveCompliancePercent}%
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${currentAudit.complianceBreakdown.gloveCompliancePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Hair Restraints</span>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      {currentAudit.complianceBreakdown.hairCapCompliancePercent}%
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${currentAudit.complianceBreakdown.hairCapCompliancePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Cross-Contact</span>
                    <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                      {currentAudit.complianceBreakdown.crossContaminationScore}%
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${currentAudit.complianceBreakdown.crossContaminationScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Surface Sanitation</span>
                    <div className="text-lg font-black text-sky-400 font-mono mt-0.5">
                      {currentAudit.complianceBreakdown.surfaceCleanlinessScore}%
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-sky-400 h-full rounded-full"
                        style={{ width: `${currentAudit.complianceBreakdown.surfaceCleanlinessScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Violations & Immediate Corrective Protocol */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Active Safety Violations & Corrective Interventions</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentAudit.detectedViolations.length} Detected
                  </span>
                </div>

                {currentAudit.detectedViolations.length > 0 ? (
                  <div className="space-y-3">
                    {currentAudit.detectedViolations.map((v) => {
                      const isResolved = resolvedViolations.includes(v.id);
                      return (
                        <div
                          key={v.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isResolved
                              ? 'border-emerald-500/30 bg-emerald-950/15 opacity-75'
                              : v.severity === 'CRITICAL'
                              ? 'border-rose-500/40 bg-rose-950/20'
                              : 'border-amber-500/30 bg-amber-950/15'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  v.severity === 'CRITICAL'
                                    ? 'bg-rose-500 text-slate-950'
                                    : 'bg-amber-500/30 text-amber-300'
                                }`}
                              >
                                {v.severity}
                              </span>
                              <span className="text-xs font-bold text-slate-200">
                                {v.category.replace('_', ' ')} • {v.locationInFrame}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Timestamp: {v.timestamp}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            {v.description}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                            <div className="text-[11px] text-amber-300">
                              <strong>Mandatory Corrective Action:</strong> {v.correctiveAction}
                            </div>
                            <button
                              onClick={() => toggleViolationResolved(v.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                                isResolved
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                              }`}
                            >
                              {isResolved ? 'Resolved ✓' : 'Mark Resolved'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zero active safety breaches detected in this video analysis cycle.</span>
                  </div>
                )}
              </div>

              {/* Positive Observations & Auditor Summary */}
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/15">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                  Compliant Observations:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {currentAudit.positiveObservations.map((obs, i) => (
                    <li key={i}>{obs}</li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-slate-300">
                  <strong className="text-emerald-400">Auditor Summary:</strong> {currentAudit.auditorSummary}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400">
              <ShieldCheck className="w-10 h-10 text-slate-600 mb-3" />
              <p className="font-semibold text-sm">Select a CCTV feed to initiate computer vision hygiene audit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
