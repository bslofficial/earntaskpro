/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { NoticeMarquee } from './components/home/NoticeMarquee';
import { BannerSlider } from './components/home/BannerSlider';
import { QuickStats } from './components/home/QuickStats';
import { TaskListView } from './components/tasks/TaskListView';
import { WalletView } from './components/wallet/WalletView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminView } from './components/admin/AdminView';

// Modals
import { DailyCheckinModal } from './components/tasks/DailyCheckinModal';
import { VideoTaskModal } from './components/tasks/VideoTaskModal';
import { LuckySpinModal } from './components/tasks/LuckySpinModal';
import { QuizModal } from './components/tasks/QuizModal';
import { ReferModal } from './components/tasks/ReferModal';
import { AuthModal } from './components/auth/AuthModal';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'task' | 'wallet' | 'profile' | 'admin'>('home');

  // Modal visibility states
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isReferOpen, setIsReferOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSelectBannerTask = (taskKey: string) => {
    if (taskKey === 'spin') setIsSpinOpen(true);
    else if (taskKey === 'video') setIsVideoOpen(true);
    else if (taskKey === 'checkin') setIsCheckinOpen(true);
    else if (taskKey === 'quiz') setIsQuizOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab as typeof activeTab)}
        activeTab={activeTab}
      />

      {/* Marquee Notice Ticker */}
      <NoticeMarquee />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 pb-28">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Carousel Slider */}
            <BannerSlider onSelectTask={handleSelectBannerTask} />

            {/* Quick Metrics & Balance */}
            <QuickStats
              onNavigateTab={(tab) => setActiveTab(tab as typeof activeTab)}
              onOpenCheckin={() => setIsCheckinOpen(true)}
            />

            {/* Core Tasks Hub */}
            <TaskListView
              onOpenCheckin={() => setIsCheckinOpen(true)}
              onOpenVideo={() => setIsVideoOpen(true)}
              onOpenSpin={() => setIsSpinOpen(true)}
              onOpenQuiz={() => setIsQuizOpen(true)}
              onOpenRefer={() => setIsReferOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: TASKS */}
        {activeTab === 'task' && (
          <div className="animate-in fade-in duration-200">
            <TaskListView
              onOpenCheckin={() => setIsCheckinOpen(true)}
              onOpenVideo={() => setIsVideoOpen(true)}
              onOpenSpin={() => setIsSpinOpen(true)}
              onOpenQuiz={() => setIsQuizOpen(true)}
              onOpenRefer={() => setIsReferOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: WALLET */}
        {activeTab === 'wallet' && <WalletView />}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenRefer={() => setIsReferOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab as typeof activeTab)}
          />
        )}

        {/* TAB 5: ADMIN */}
        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as typeof activeTab)}
      />

      {/* Interactive Modals */}
      <DailyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
      />

      <VideoTaskModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />

      <LuckySpinModal
        isOpen={isSpinOpen}
        onClose={() => setIsSpinOpen(false)}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      <ReferModal
        isOpen={isReferOpen}
        onClose={() => setIsReferOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
