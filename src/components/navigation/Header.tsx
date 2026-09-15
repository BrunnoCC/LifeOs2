import React from 'react';
import { Plus } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

interface HeaderProps {
  onOpenQuickAdd?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickAdd }) => {
  const { user } = useAuthContext();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    const dateStr = new Date().toLocaleDateString('pt-BR', options);
    // Capitalize first letter of day
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  return (
    <header className="bg-[#081425]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20 px-4 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Greeting & Date */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 tracking-tight">
            {getGreeting()}, <span className="text-indigo-400">{user?.full_name || 'Usuário'}</span>
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Online
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">
          {getFormattedDate()}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        {onOpenQuickAdd && (
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Registro</span>
          </button>
        )}
      </div>
    </header>
  );
};
