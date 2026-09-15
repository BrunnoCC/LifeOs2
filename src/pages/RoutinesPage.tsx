import React, { useState } from 'react';
import { useRoutines } from '../hooks/useRoutines';
import type { RoutineType } from '../types';
import { 
  Clock, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Sun, 
  Moon, 
  BookOpen, 
  Dumbbell, 
  Sparkles,
  X 
} from 'lucide-react';

export const RoutinesPage: React.FC = () => {
  const todayISO = new Date().toISOString().split('T')[0];
  const { routines, routineLogs, createRoutine, deleteRoutine, addRoutineItem, deleteRoutineItem, toggleItemLog } = useRoutines(todayISO);

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineType, setRoutineType] = useState<RoutineType>('morning');

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDuration, setItemDuration] = useState(15);
  const [itemTime, setItemTime] = useState('');

  const ROUTINE_THEMES: Record<RoutineType, {
    emoji: string;
    icon: React.ReactNode;
    label: string;
    gradient: string;
    iconBg: string;
    badgeBg: string;
    border: string;
  }> = {
    morning:  {
      emoji: '🌅',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      label: 'Manhã',
      gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      border: 'border-amber-500/20',
    },
    afternoon: {
      emoji: '☀️',
      icon: <Sun className="w-4 h-4 text-orange-400" />,
      label: 'Tarde',
      gradient: 'from-orange-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-orange-500/15 border-orange-500/30',
      badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      border: 'border-orange-500/20',
    },
    night: {
      emoji: '🌙',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      label: 'Noite',
      gradient: 'from-indigo-500/10 via-slate-500/5 to-transparent',
      iconBg: 'bg-indigo-500/15 border-indigo-500/30',
      badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      border: 'border-indigo-500/20',
    },
    study: {
      emoji: '📚',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      label: 'Estudos',
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      border: 'border-emerald-500/20',
    },
    workout: {
      emoji: '💪',
      icon: <Dumbbell className="w-4 h-4 text-rose-400" />,
      label: 'Treino',
      gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
      iconBg: 'bg-rose-500/15 border-rose-500/30',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      border: 'border-rose-500/20',
    },
    custom: {
      emoji: '✨',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      label: 'Personalizada',
      gradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      border: 'border-purple-500/20',
    },
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName.trim()) return;

    createRoutine({
      name: routineName,
      type: routineType,
      color: '#6366f1',
      items: []
    });

    setRoutineName('');
    setIsRoutineModalOpen(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoutineId || !itemName.trim()) return;

    addRoutineItem(activeRoutineId, {
      name: itemName,
      estimated_duration: Number(itemDuration),
      time: itemTime || undefined,
      priority: 'normal',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      order_index: 0
    });

    setItemName('');
    setIsItemModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" /> Rotinas em Blocos
          </h2>
          <p className="text-xs text-slate-400 mt-1">Crie sequências de hábitos e atividades organizadas por blocos do dia.</p>
        </div>

        <button
          onClick={() => setIsRoutineModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Criar Bloco de Rotina
        </button>
      </div>

      {/* Routine Blocks Grid */}
      {routines.length === 0 ? (
        <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Você ainda não possui blocos de rotina</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Organize seu dia criando blocos como "Rotina da Manhã", "Rotina de Estudos" ou "Rotina Noturna".
          </p>
          <button
            onClick={() => setIsRoutineModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            + Criar Bloco de Rotina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map((routine) => {
            const theme = ROUTINE_THEMES[routine.type] ?? ROUTINE_THEMES.custom;
            const completedCount = routine.items.filter(item => routineLogs.some(l => l.routine_item_id === item.id)).length;
            const completionPct = routine.items.length > 0 ? Math.round((completedCount / routine.items.length) * 100) : 0;
            return (
              <div key={routine.id} className={`bg-[#0d1627] border ${theme.border} rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden`}>
                {/* Gradient accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none rounded-2xl`} />

                <div className="relative">
                  {/* Block Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Emoji + icon */}
                      <div className={`w-10 h-10 rounded-xl border ${theme.iconBg} flex items-center justify-center text-xl`}>
                        {theme.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm leading-tight">{routine.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                            {theme.label}
                          </span>
                          <span className="text-[10px] text-slate-500">{routine.items.length} atividades</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveRoutineId(routine.id);
                          setIsItemModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 rounded-lg text-xs font-medium"
                      >
                        + Atividade
                      </button>
                      <button
                        onClick={() => deleteRoutine(routine.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {routine.items.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>{completedCount}/{routine.items.length} concluídos</span>
                        <span className="font-bold">{completionPct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${completionPct}%`,
                            background: completionPct === 100
                              ? 'linear-gradient(90deg,#10b981,#34d399)'
                              : `linear-gradient(90deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                            backgroundColor: completionPct === 100 ? undefined : '#6366f1',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Routine Items List */}
                  <div className="space-y-2">
                    {routine.items.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">Nenhuma atividade neste bloco. Clique em "+ Atividade".</p>
                    ) : (
                      routine.items.map((item) => {
                        const isDone = routineLogs.some(l => l.routine_item_id === item.id);
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                              isDone
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => toggleItemLog(item.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-700 hover:border-indigo-400 bg-slate-950'
                                }`}
                              >
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                              <span className={`truncate ${isDone ? 'line-through text-slate-400' : ''}`}>{item.name}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {item.time && <span className="text-[10px] text-slate-400 tabular-nums">{item.time}</span>}
                              {item.estimated_duration && (
                                <span className="text-[10px] text-slate-600">{item.estimated_duration}min</span>
                              )}
                              <button
                                onClick={() => deleteRoutineItem(routine.id, item.id)}
                                className="text-slate-600 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ROUTINE MODAL */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1627] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Criar Bloco de Rotina</h3>
              <button onClick={() => setIsRoutineModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoutine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Bloco</label>
                <input
                  type="text"
                  required
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="Ex: Rotina da Manhã, Rotina de Estudos"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Rotina</label>
                <select
                  value={routineType}
                  onChange={(e) => setRoutineType(e.target.value as RoutineType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="night">Noite</option>
                  <option value="study">Estudos</option>
                  <option value="workout">Treino</option>
                  <option value="custom">Personalizada</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoutineModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-600/20"
                >
                  Salvar Bloco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1627] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Adicionar Atividade à Rotina</h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Atividade</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Ex: Meditação 10 min, Beber água"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={itemDuration}
                    onChange={(e) => setItemDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário (opcional)</label>
                  <input
                    type="time"
                    value={itemTime}
                    onChange={(e) => setItemTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-600/20"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
