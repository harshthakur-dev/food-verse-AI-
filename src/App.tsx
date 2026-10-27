import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { OverviewDashboard } from './components/OverviewDashboard.tsx';
import { FoodScannerView } from './components/FoodScannerView.tsx';
import { FreshnessDetectorView } from './components/FreshnessDetectorView.tsx';
import { HygieneInspectorView } from './components/HygieneInspectorView.tsx';
import { SmartCookingView } from './components/SmartCookingView.tsx';
import { MealPlannerView } from './components/MealPlannerView.tsx';
import { ArchitectureEpicsView } from './components/ArchitectureEpicsView.tsx';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { ActiveTab, FoodScan, FreshnessReport, HygieneInspectionReport, UserProfile } from './types/foodverse.ts';
import { api } from './services/api.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [recentScans, setRecentScans] = useState<FoodScan[]>([]);
  const [recentFreshness, setRecentFreshness] = useState<FreshnessReport[]>([]);
  const [recentAudits, setRecentAudits] = useState<HygieneInspectionReport[]>([]);
  const [aiConfigured, setAiConfigured] = useState<boolean>(true);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [userRes, scansRes, freshnessRes, auditsRes, statsRes] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getFoodScans().catch(() => null),
        api.getFreshnessHistory().catch(() => null),
        api.getHygieneAudits().catch(() => null),
        api.getOverviewStats().catch(() => null),
      ]);

      if (userRes?.success) setUser(userRes.user);
      if (scansRes?.success) setRecentScans(scansRes.data);
      if (freshnessRes?.success) setRecentFreshness(freshnessRes.data);
      if (auditsRes?.success) setRecentAudits(auditsRes.data);
      if (statsRes?.success) setAiConfigured(statsRes.data.aiConfigured);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  const handleScanComplete = (scan: FoodScan) => {
    setRecentScans((prev) => [scan, ...prev.filter((s) => s.id !== scan.id)]);
  };

  const handleFreshnessComplete = (report: FreshnessReport) => {
    setRecentFreshness((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
  };

  const handleAuditComplete = (audit: HygieneInspectionReport) => {
    setRecentAudits((prev) => [audit, ...prev.filter((a) => a.id !== audit.id)]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        user={user}
        aiConfigured={aiConfigured}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'overview' && (
          <OverviewDashboard
            setActiveTab={setActiveTab}
            recentScans={recentScans}
            recentFreshness={recentFreshness}
            recentAudits={recentAudits}
            user={user}
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        )}

        {activeTab === 'food-scanner' && (
          <FoodScannerView
            onScanComplete={handleScanComplete}
            recentScans={recentScans}
          />
        )}

        {activeTab === 'freshness' && (
          <FreshnessDetectorView
            onReportGenerated={handleFreshnessComplete}
            recentFreshness={recentFreshness}
          />
        )}

        {activeTab === 'hygiene' && (
          <HygieneInspectorView
            onAuditComplete={handleAuditComplete}
            recentAudits={recentAudits}
          />
        )}

        {activeTab === 'cooking' && (
          <SmartCookingView />
        )}

        {activeTab === 'meal-planner' && (
          <MealPlannerView
            user={user}
            onProfileUpdated={(updated) => setUser(updated)}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureEpicsView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Food Verse AI</span>
            <span>—</span>
            <span>Multimodal Food, Freshness & Hygiene Agent</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>9 Epics • 16 Tasks</span>
            <span>React + Express + FastAPI</span>
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUserUpdated={(updated) => setUser(updated)}
      />
    </div>
  );
}
