import React from 'react';
import {
  Sparkles,
  Camera,
  Apple,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  Layers,
  Mic,
  User,
  Activity,
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types/foodverse.ts';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenVoice: () => void;
  onOpenProfile: () => void;
  user: UserProfile | null;
  aiConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenVoice,
  onOpenProfile,
  user,
  aiConfigured,
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'overview', label: 'Command Center', icon: <Activity className="w-4 h-4" /> },
    { id: 'food-scanner', label: 'Food & Nutrition', icon: <Camera className="w-4 h-4" />, badge: 'Vision' },
    { id: 'freshness', label: 'Freshness Radar', icon: <Apple className="w-4 h-4" /> },
    { id: 'hygiene', label: 'Kitchen Hygiene', icon: <ShieldCheck className="w-4 h-4" />, badge: 'CCTV' },
    { id: 'cooking', label: 'Smart Chef', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'meal-planner', label: 'Meal Planner', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'architecture', label: '9 Epics & Tech', icon: <Layers className="w-4 h-4" />, badge: '16 Tasks' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                  Food Verse AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Multimodal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Intelligent Food, Freshness & Hygiene Agent
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Voice Assistant Button */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold shadow-sm transition-all"
              title="Speak with Food Verse Voice Agent"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">Voice Agent</span>
            </button>

            {/* AI Engine Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  aiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span className="font-mono text-[10px] text-slate-400">Gemini 3.8</span>
            </div>

            {/* User Profile trigger */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/40">
                {user?.name ? user.name.charAt(0) : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden md:inline max-w-[100px] truncate text-slate-300">
                {user?.name || 'Chef Harsh'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
