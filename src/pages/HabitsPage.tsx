import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import type { HabitFrequency } from '../types';
import { 
  Flame, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  X 
} from 'lucide-react';

export const HabitsPage: React.FC = () => {
  const { habitsWithStats, createHabit, deleteHabit, toggleHabitToday, toggleHabitForDate } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterFrequency, setFilterFrequency] = useState<'all' | 'daily' | 'weekly'>('all');
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('vezes');
  const [category, setCategory] = useState('Saúde');

  // Helper to generate last 7 days for the visual matrix
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'narrow' });
      days.push({ iso, dayName });
    }
    return days;
  };

  const last7Days = getLast7Days();

  const filteredHabits = habitsWithStats.filter(h => {
    if (filterFrequency === 'daily') return h.frequency === 'daily';
    if (filterFrequency === 'weekly') return h.frequency === 'weekly' || h.frequency === 'weekly_days';
    return true;
  });

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createHabit({
      name,
      description,
      frequency,
      weekly_target: frequency === 'weekly' ? Number(weeklyTarget) : undefined,
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      target_value: Number(targetValue),
      unit,
      category,
      color: '#34d399',
      archived: false
    });

    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" /> Habit Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">Construa disciplina diária e semanal com contadores de sequências (🔥 Streaks).</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Criar Hábito
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'Todos os Hábitos' },
          { id: 'daily', label: 'Diários' },
          { id: 'weekly', label: 'Semanais' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterFrequency(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterFrequency === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Habits Grid / Matrix View */}
      {filteredHabits.length === 0 ? (
        <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-12 text-center">
          <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Nenhum hábito encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Acompanhe a frequência diária ou semanal de leitura, treinos, hidratação ou meditação.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            + Criar Hábito
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              className="bg-[#0d1627] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
            >
              {/* Habit Details */}
              <div className="flex items-start gap-4 min-w-0">
                <button
                  onClick={() => toggleHabitToday(habit.id)}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                    habit.completedToday
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'border-slate-700 hover:border-amber-400 bg-slate-950 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>

                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-bold truncate ${habit.completedToday ? 'text-emerald-300' : 'text-slate-100'}`}>
                      {habit.name}
                    </h3>
                    {habit.frequency === 'weekly' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Semanal ({habit.weeklyCompletionsCount}/{habit.weekly_target || 3}x)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Diário
                      </span>
                    )}
                    {habit.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        {habit.category}
                      </span>
                    )}
                  </div>
                  {habit.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{habit.description}</p>}
                  <p className="text-[11px] text-slate-500 mt-1">Meta: {habit.target_value} {habit.unit}</p>
                </div>
              </div>

              {/* Weekly Matrix History Grid */}
              <div className="flex items-center gap-6 justify-between md:justify-end">
                <div className="flex items-center gap-2">
                  {last7Days.map((day) => {
                    const isLogged = habit.logs.some(l => l.date === day.iso && l.completed);
                    return (
                      <button
                        key={day.iso}
                        onClick={() => toggleHabitForDate(habit.id, day.iso)}
                        title={`${day.iso}: ${isLogged ? 'Concluído' : 'Pendente'}`}
                        className={`w-7 h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-semibold transition-all ${
                          isLogged
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[9px] uppercase">{day.dayName}</span>
                        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isLogged ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Streak Badge & Delete */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold shrink-0">
                    <Flame className="w-4 h-4 fill-amber-400" />
                    <span>{habit.currentStreak}d</span>
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE HABIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1627] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Criar Novo Hábito</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Hábito</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Leitura 30 min, Treino 3x na semana"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Frequência</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="daily">Todos os dias (Diário)</option>
                  <option value="weekly">Semanal (Metas por semana)</option>
                </select>
              </div>

              {frequency === 'weekly' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Meta de vezes por semana</label>
                  <input
                    type="number"
                    value={weeklyTarget}
                    onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                    min={1}
                    max={7}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Ler capítulo do livro técnico"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantidade por ocorrência</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="ex: minutos, vezes, litros"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Saúde, Intelecto, Produtividade"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Salvar Hábito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
