import React from 'react';
import { Sidebar } from '../components/navigation/Sidebar';
import { Header } from '../components/navigation/Header';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';

interface MainLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickAdd?: () => void;
  onSearchClick?: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  onSearchClick,
  children
}) => {
  return (
    <div className="flex min-h-screen bg-[#081425] text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={onSelectTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Header onOpenQuickAdd={onOpenQuickAdd} onSearchClick={onSearchClick} />
        
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={onSelectTab} />
    </div>
  );
};
