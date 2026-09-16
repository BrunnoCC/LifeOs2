import React from 'react';
import { useTasks } from '../hooks/useTasks';
import { useRoutines } from '../hooks/useRoutines';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { useStudies } from '../hooks/useStudies';
import { useWorkouts } from '../hooks/useWorkouts';
import { useJournal } from '../hooks/useJournal';
import {
  CheckSquare, Clock, Flame, Plus, ArrowRight,
  CheckCircle2, Zap, Info, Award,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

const today = new Date().toISOString().split('T')[0];

// ─── Mini nav card ────────────────────────────────────────────────────────────
const NavCard: React.FC<{
  emoji: string;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  border: string;
  onClick: () => void;
}> = ({ emoji, label, value, sub, color, border, onClick }) => (
  <button
    onClick={onClick}
    className={`group bg-[#0d1627] border ${border} rounded-2xl p-4 text-left transition-all hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 active:scale-[0.98] flex flex-col gap-2`}
  >
    <div className="flex items-center justify-between">
      <span className="text-lg">{emoji}</span>
      <ArrowRight className={`w-3.5 h-3.5 ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
    <div>
      <p className={`text-xl font-extrabold tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xs text-slate-600 mt-1 leading-tight">{sub}</p>
    </div>
  </button>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const { tasks, toggleTaskStatus } = useTasks();
  const { routines, routineLogs, toggleItemLog } = useRoutines(today);
  const { habitsWithStats, toggleHabitToday } = useHabits();
  const { goals } = useGoals();
  const { sessions: studySessions } = useStudies();
  const { logs: workoutLogs } = useWorkouts();
  const { entries: journalEntries } = useJournal();

  // ── Core metrics ────────────────────────────────────────────────────────────
  const todayTasks = tasks.filter(t => t.date === today || t.status === 'in_progress' || !t.date);
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed');

  const totalRoutineItems = routines.reduce((a, r) => a + r.items.length, 0);
  const completedRoutineItems = routineLogs.length;

  const completedHabitsCount = habitsWithStats.filter(h => h.completedToday).length;
  const habitProgressPct = habitsWithStats.length > 0
    ? Math.round((completedHabitsCount / habitsWithStats.length) * 100) : 0;

  const overallProgressPct = Math.round(
    ((completedTodayTasks.length + completedRoutineItems + completedHabitsCount) /
      Math.max(todayTasks.length + totalRoutineItems + habitsWithStats.length, 1)) * 100,
  );

  // ── Other module metrics ─────────────────────────────────────────────────────
  const goalsInProgress = goals.filter(g => g.status === 'in_progress').length;
  const goalsAchieved = goals.filter(g => g.status === 'achieved').length;

  const thisWeekStudy = studySessions.filter(s => {
    const d = new Date(s.date);
    const start = new Date(); start.setDate(start.getDate() - start.getDay());
    return d >= start;
  });
  const studyHoursWeek = Math.round(thisWeekStudy.reduce((a, s) => a + s.duration_minutes, 0) / 60 * 10) / 10;

  const thisWeekWorkouts = workoutLogs.filter(l => {
    const d = new Date(l.date);
    const start = new Date(); start.setDate(start.getDate() - start.getDay());
    return d >= start;
  });

  const todayJournal = journalEntries.find(e => e.date === today);
  const journalStreak = (() => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const iso = d.toISOString().slice(0, 10);
      if (journalEntries.find(e => e.date === iso)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  })();

  return (
    <div className="space-y-6">

      {/* ── Hero grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall progress */}
        <div className="bg-[#0d1627] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progresso Geral do Dia</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-100 tabular-nums">{overallProgressPct}%</span>
            <span className="text-xs text-slate-400">meta de execução</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgressPct}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-[#0d1627] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tarefas de Hoje</span>
            <button onClick={() => onNavigate('tasks')} className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100 tabular-nums">{completedTodayTasks.length}</span>
            <span className="text-slate-400 text-sm">de {todayTasks.length} concluídas</span>
          </div>
          <p className="text-xs text-slate-400">{todayTasks.length - completedTodayTasks.length} pendentes para finalizar hoje.</p>
        </div>

        {/* Habits */}
        <div className="bg-[#0d1627] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hábitos do Dia</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100 tabular-nums">{completedHabitsCount}</span>
            <span className="text-slate-400 text-sm">de {habitsWithStats.length} hábitos</span>
          </div>
          <p className="text-xs text-slate-400">
            {habitsWithStats.length === 0 ? 'Nenhum hábito cadastrado.' : `${habitProgressPct}% dos hábitos concluídos hoje.`}
          </p>
        </div>
      </div>

      {/* ── All-modules mini cards ── */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Visão Geral do LifeDocs</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <NavCard
            emoji="✅"
            label="Tarefas"
            value={`${completedTodayTasks.length}/${todayTasks.length}`}
            sub="concluídas hoje"
            color="text-indigo-400"
            border="border-slate-800 hover:border-indigo-500/40"
            onClick={() => onNavigate('tasks')}
          />
          <NavCard
            emoji="⏱️"
            label="Rotinas"
            value={`${completedRoutineItems}/${totalRoutineItems}`}
            sub="itens feitos"
            color="text-sky-400"
            border="border-slate-800 hover:border-sky-500/40"
            onClick={() => onNavigate('routines')}
          />
          <NavCard
            emoji="🎯"
            label="Metas"
            value={goalsInProgress}
            sub={`${goalsAchieved} concluídas`}
            color="text-violet-400"
            border="border-slate-800 hover:border-violet-500/40"
            onClick={() => onNavigate('goals')}
          />
          <NavCard
            emoji="📚"
            label="Estudos"
            value={`${studyHoursWeek}h`}
            sub="esta semana"
            color="text-emerald-400"
            border="border-slate-800 hover:border-emerald-500/40"
            onClick={() => onNavigate('studies')}
          />
          <NavCard
            emoji="💪"
            label="Treinos"
            value={thisWeekWorkouts.length}
            sub="sessões esta semana"
            color="text-rose-400"
            border="border-slate-800 hover:border-rose-500/40"
            onClick={() => onNavigate('workouts')}
          />
          <NavCard
            emoji="📔"
            label="Diário"
            value={journalStreak > 0 ? `${journalStreak}d` : '—'}
            sub={todayJournal ? '✓ Escrito hoje' : 'Sem entrada hoje'}
            color="text-fuchsia-400"
            border={`border-slate-800 hover:border-fuchsia-500/40 ${!todayJournal ? 'border-dashed' : ''}`}
            onClick={() => onNavigate('journal')}
          />
        </div>
      </div>

      {/* ── Tasks + Habits ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Widget */}
        <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Tarefas Prioritárias</h3>
            </div>
            <button
              onClick={onOpenQuickAdd}
              className="px-2.5 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Nova
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="flex-1 py-10 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">Você não possui tarefas pendentes para hoje.</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">Aproveite para focar em estudos, hábitos ou crie uma nova tarefa.</p>
              <button
                onClick={onOpenQuickAdd}
                className="mt-4 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all"
              >
                + Criar primeira tarefa
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {todayTasks.slice(0, 5).map((task) => {
                const subtaskCompleted = task.subtasks?.filter(s => s.completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;
                return (
                  <div
                    key={task.id}
                    className="relative group p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${task.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-indigo-400 bg-slate-950'
                            }`}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div className="truncate">
                          <p className={`text-xs font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </p>
                          {task.category && <span className="text-[10px] text-slate-400">{task.category}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.priority && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${task.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            task.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                            {task.priority}
                          </span>
                        )}
                        <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                    {/* Hover tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 absolute left-0 right-0 top-full mt-1.5 z-20 bg-[#081425] border border-indigo-500/30 p-3 rounded-xl shadow-2xl space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[10px] text-indigo-400 font-semibold uppercase">
                        <span>Detalhes da Tarefa</span>
                        <span>{task.category || 'Geral'}</span>
                      </div>
                      {task.description
                        ? <p className="text-[11px] text-slate-300 leading-snug">{task.description}</p>
                        : <p className="text-[11px] text-slate-500 italic">Sem descrição detalhada.</p>}
                      {totalSubtasks > 0 && (
                        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Subtarefas:</span>
                          <span className="font-semibold text-emerald-400">{subtaskCompleted}/{totalSubtasks} concluídas</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Habit Tracker Widget */}
        <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Hábitos Diários</h3>
            </div>
            <button onClick={() => onNavigate('habits')} className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              Gerenciar <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {habitsWithStats.length === 0 ? (
            <div className="flex-1 py-10 flex flex-col items-center justify-center text-center">
              <Flame className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">Nenhum hábito cadastrado ainda.</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">Defina novos hábitos para acompanhar seu progresso e manter sequências.</p>
              <button onClick={() => onNavigate('habits')} className="mt-4 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-all">
                + Adicionar hábito
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {habitsWithStats.map((habit) => (
                <div key={habit.id} className="relative group p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabitToday(habit.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${habit.completedToday
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : 'border-slate-700 hover:border-amber-400 bg-slate-950'
                          }`}
                      >
                        {habit.completedToday && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className={`text-xs font-medium ${habit.completedToday ? 'text-emerald-300 font-semibold' : 'text-slate-200'}`}>
                          {habit.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{habit.target_value} {habit.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{habit.currentStreak}d</span>
                      </div>
                      <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                  {/* Hover tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 absolute left-0 right-0 top-full mt-1.5 z-20 bg-[#081425] border border-amber-500/30 p-3 rounded-xl shadow-2xl space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold uppercase">
                      <span>Detalhes do Hábito</span>
                      <span>{habit.category || 'Geral'}</span>
                    </div>
                    {habit.description && <p className="text-[11px] text-slate-300 leading-snug">{habit.description}</p>}
                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Recorde:
                      </span>
                      <span className="font-bold text-amber-300">{habit.bestStreak} dias</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Frequência:</span>
                      <span className="font-semibold text-slate-200">{habit.frequency === 'weekly' ? `Semanal (${habit.weekly_target || 3}x)` : 'Diário'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Routine Blocks ── */}
      <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Rotinas em Blocos</h3>
          </div>
          <button onClick={() => onNavigate('routines')} className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
            Configurar rotinas <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Clock className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-300">Nenhuma rotina configurada.</p>
            <p className="text-[11px] text-slate-500 mt-1">Crie blocos de rotina da manhã, noite ou estudos para estruturar seu dia.</p>
            <button
              onClick={() => onNavigate('routines')}
              className="mt-3 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-medium"
            >
              + Criar Bloco de Rotina
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-200">{routine.name}</h4>
                  <span className="text-[10px] text-slate-400">{routine.items.length} atividades</span>
                </div>
                <div className="space-y-2">
                  {routine.items.map((item) => {
                    const isDone = routineLogs.some(l => l.routine_item_id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemLog(item.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border text-xs ${isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700'
                            }`}>
                            {isDone && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.time && <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{item.time}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
