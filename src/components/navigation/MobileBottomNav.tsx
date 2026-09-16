import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Flame, 
  User,
  BookHeart
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onSelectTab }) => {
  const items = [
    { id: 'dashboard', label: 'Início',  icon: LayoutDashboard },
    { id: 'tasks',     label: 'Tarefas', icon: CheckSquare },
    { id: 'habits',    label: 'Hábitos', icon: Flame },
    { id: 'journal',   label: 'Diário',  icon: BookHeart },
    { id: 'profile',   label: 'Perfil',  icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0d1627]/95 backdrop-blur-lg border-t border-slate-800 z-40 px-2 py-1.5 flex justify-around items-center">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-400'} transition-transform`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
