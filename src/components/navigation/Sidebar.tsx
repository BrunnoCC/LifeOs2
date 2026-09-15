import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  Flame, 
  BookOpen, 
  Target, 
  Dumbbell, 
  User, 
  LogOut, 
  Compass,
  Zap,
  BookHeart
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuthContext();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'routines', label: 'Rotinas', icon: Clock },
    { id: 'habits', label: 'Hábitos', icon: Flame },
    { id: 'studies', label: 'Estudos', icon: BookOpen },
    { id: 'focus', label: 'Modo Foco', icon: Zap },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'workouts', label: 'Treinos', icon: Dumbbell },
    { id: 'journal',  label: 'Diário',  icon: BookHeart },
    { id: 'profile', label: 'Perfil & Ajustes', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0d1627] border-r border-slate-800 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-lg shadow-indigo-500/10">
            <Compass className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-none">LifeOS</h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Painel Pessoal</span>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
          v2.0
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Pill at Bottom */}
      <div className="p-3 m-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div 
          onClick={() => onSelectTab('profile')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Usuário'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sair da Conta"
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
