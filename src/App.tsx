import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { HabitsPage } from './pages/HabitsPage';
import { StudiesPage } from './pages/StudiesPage';
import { FocusPage } from './pages/FocusPage';
import { GoalsPage } from './pages/GoalsPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { ProfilePage } from './pages/ProfilePage';
import { JournalPage } from './pages/JournalPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuthContext();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081425] flex items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Carregando LifeDocs...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthLayout>
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
      </AuthLayout>
    );
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} onOpenQuickAdd={() => setCurrentTab('tasks')} />;
      case 'tasks':
        return <TasksPage />;
      case 'routines':
        return <RoutinesPage />;
      case 'habits':
        return <HabitsPage />;
      case 'studies':
        return <StudiesPage />;
      case 'focus':
        return <FocusPage />;
      case 'goals':
        return <GoalsPage />;
      case 'workouts':
        return <WorkoutsPage />;
      case 'journal':
        return <JournalPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} onOpenQuickAdd={() => setCurrentTab('tasks')} />;
    }
  };

  return (
    <MainLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onOpenQuickAdd={() => setCurrentTab('tasks')}
    >
      {renderActiveTab()}
    </MainLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
