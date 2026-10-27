import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  Server,
  Cpu,
  Database,
  Code2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
} from 'lucide-react';
import { Epic } from '../types/foodverse.ts';
import { api } from '../services/api.ts';

export const ArchitectureEpicsView: React.FC = () => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'epics' | 'architecture' | 'tech-stack' | 'api-docs'>('epics');

  useEffect(() => {
    loadEpicsAndStats();
  }, []);

  const loadEpicsAndStats = async () => {
    try {
      const [epicsRes, statsRes] = await Promise.all([
        api.getEpics(),
        api.getOverviewStats(),
      ]);
      if (epicsRes.success) setEpics(epicsRes.data.epics);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load epics:', err);
    }
  };

  const allTasks = epics.flatMap((e) => e.tasks);
  const completedCount = allTasks.filter((t) => t.completed).length;
  const filteredEpics = epics.map((epic) => ({
    ...epic,
    tasks: epic.tasks.filter((t) => selectedLayer === 'All' || t.layer === selectedLayer),
  })).filter((epic) => epic.tasks.length > 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              System Architecture & Epics Tracker
            </span>
            <span className="text-xs text-slate-400">Epics: 9 • Total Tasks: 16 • Subtasks: 0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Food Verse AI – Technical Roadmap & Full-Stack Blueprint
          </h2>
          <p className="text-sm text-slate-400">
            Comprehensive audit of the 9 core project epics, modular Node.js/Express backend, Python FastAPI microservices, and Gemini 3.8 Flash multimodal reasoning engine.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('epics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'epics'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Epics & 16 Tasks
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('tech-stack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tech-stack'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tech Stack
          </button>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Epics</span>
          <div className="text-2xl font-black text-white mt-1">9 Epics</div>
          <p className="text-xs text-emerald-400 mt-0.5">100% Implemented & Verified</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Tasks</span>
          <div className="text-2xl font-black text-white mt-1">16 Tasks</div>
          <p className="text-xs text-indigo-400 mt-0.5">0 Subtasks remaining</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-400 uppercase">Runtime Architecture</span>
          <div className="text-base font-black text-white mt-1 font-mono">React + Express + FastAPI</div>
          <p className="text-xs text-slate-400 mt-0.5">Port 3000 unified bridge</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-400 uppercase">AI Reasoning Core</span>
          <div className="text-base font-black text-emerald-400 mt-1 font-mono">gemini-3.8-flash</div>
          <p className="text-xs text-slate-400 mt-0.5">User-Agent: aistudio-build</p>
        </div>
      </div>

      {activeTab === 'epics' && (
        <div className="space-y-6">
          {/* Layer Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase mr-1">Filter Layer:</span>
            {['All', 'Frontend', 'Backend', 'AI Service'].map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedLayer === layer
                    ? 'bg-indigo-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>

          {/* Epics List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEpics.map((epic) => (
              <div
                key={epic.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      Epic {epic.epicNumber}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{epic.status}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{epic.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{epic.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Tasks ({epic.tasks.length}):
                  </span>
                  {epic.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-200 font-medium leading-tight">
                          {task.title}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            task.layer === 'Frontend'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : task.layer === 'Backend'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-indigo-500/15 text-indigo-400'
                          }`}
                        >
                          {task.layer}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>End-to-End System Architecture Diagram</span>
          </h3>

          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed overflow-x-auto space-y-6">
            <div className="text-slate-400 pb-2 border-b border-slate-800">
              # FOOD VERSE AI MULTIMODAL COMPONENT PIPELINE
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-900 border border-emerald-500/30 space-y-2">
                <div className="text-emerald-400 font-bold uppercase">1. Frontend Layer</div>
                <div className="text-slate-300">React 19 SPA</div>
                <div className="text-slate-400 text-[11px]">
                  - Tailwind CSS v4<br/>
                  - Motion animations<br/>
                  - Live Camera WebRTC<br/>
                  - Web Speech API
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 border border-amber-500/30 space-y-2">
                <div className="text-amber-400 font-bold uppercase">2. Backend Gateway</div>
                <div className="text-slate-300">Express + Node (tsx)</div>
                <div className="text-slate-400 text-[11px]">
                  - /api/food<br/>
                  - /api/freshness<br/>
                  - /api/hygiene<br/>
                  - /api/cooking<br/>
                  - /api/mealplans
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 border border-sky-500/30 space-y-2">
                <div className="text-sky-400 font-bold uppercase">3. Microservice / DB</div>
                <div className="text-slate-300">Python FastAPI + Mongo</div>
                <div className="text-slate-400 text-[11px]">
                  - python_fastapi_agent/main.py<br/>
                  - Mongoose-compatible Store<br/>
                  - User Profiles & Audits<br/>
                  - Food Scans Collection
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 border border-indigo-500/30 space-y-2">
                <div className="text-indigo-400 font-bold uppercase">4. AI Intelligence Core</div>
                <div className="text-slate-300">Gemini 3.8 Flash SDK</div>
                <div className="text-slate-400 text-[11px]">
                  - @google/genai 2.4.0<br/>
                  - Multimodal Vision CV<br/>
                  - Perishable Optical Decay<br/>
                  - HACCP CCTV Compliance<br/>
                  - Conversational Chef AI
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tech-stack' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span>Full-Stack Technologies</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">Frontend Framework</span>
                <span className="font-mono text-emerald-400">React 19 + TypeScript</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">Styling System</span>
                <span className="font-mono text-teal-400">Tailwind CSS v4</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">Backend Server</span>
                <span className="font-mono text-amber-400">Express 4.21 + tsx Node runtime</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">Database Engine</span>
                <span className="font-mono text-emerald-400">MongoDB with Mongoose schemas (in-memory persistent bridge)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">Python AI Microservice</span>
                <span className="font-mono text-sky-400">FastAPI 0.115 + Uvicorn (/ai-services/python_fastapi_agent)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">AI Model & SDK</span>
                <span className="font-mono text-indigo-400">@google/genai ^2.4.0 (gemini-3.8-flash)</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <span>Project Directory Structure</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <div>📁 /</div>
              <div className="pl-4">├── 📁 <strong>frontend (src/)</strong></div>
              <div className="pl-8">├── components/ (Dashboard, Scanner, Freshness, Hygiene, Cooking, Planner)</div>
              <div className="pl-8">├── services/ (api.ts)</div>
              <div className="pl-8">└── types/ (foodverse.ts)</div>
              <div className="pl-4">├── 📁 <strong>backend/</strong></div>
              <div className="pl-8">├── routes/ (auth, food, freshness, hygiene, cooking, mealplans, stats)</div>
              <div className="pl-8">├── middleware/ (auth.ts)</div>
              <div className="pl-8">└── db/ (store.ts with Mongoose models)</div>
              <div className="pl-4">├── 📁 <strong>ai-services/</strong></div>
              <div className="pl-8">├── geminiClient.ts (GoogleGenAI User-Agent telemetry)</div>
              <div className="pl-8">├── foodRecognitionService.ts</div>
              <div className="pl-8">├── freshnessService.ts</div>
              <div className="pl-8">├── hygieneInspectionService.ts</div>
              <div className="pl-8">├── cookingChefService.ts</div>
              <div className="pl-8">├── mealPlannerService.ts</div>
              <div className="pl-8">└── 📁 <strong>python_fastapi_agent/</strong> (main.py, requirements.txt)</div>
              <div className="pl-4">└── 📄 <strong>server.ts</strong> (Port 3000 Unified Dev & Production Entry)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
