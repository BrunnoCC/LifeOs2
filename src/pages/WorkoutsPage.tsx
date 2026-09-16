import React, { useState } from 'react';
import {
  Dumbbell, Plus, Trash2, Edit3, X, Play,
  Clock, TrendingUp, Calendar,
  BarChart2, CheckCircle2, Minus,
} from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import type { Workout, WorkoutExercise, WorkoutLog, MuscleGroup, WorkoutDifficulty } from '../types';

const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Pernas', 'Glúteos', 'Abdômen', 'Cardio', 'Full Body', 'Outro',
];

const DIFFICULTY_CONFIG: Record<WorkoutDifficulty, { label: string; color: string; bg: string }> = {
  leve: { label: 'Leve', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
  moderado: { label: 'Moderado', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
  intenso: { label: 'Intenso', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300' },
};

const MUSCLE_COLORS: Record<string, string> = {
  Peito: 'bg-rose-500/20 text-rose-300', Costas: 'bg-sky-500/20 text-sky-300',
  Ombros: 'bg-violet-500/20 text-violet-300', Bíceps: 'bg-amber-500/20 text-amber-300',
  Tríceps: 'bg-orange-500/20 text-orange-300', Pernas: 'bg-emerald-500/20 text-emerald-300',
  Glúteos: 'bg-pink-500/20 text-pink-300', Abdômen: 'bg-yellow-500/20 text-yellow-300',
  Cardio: 'bg-red-500/20 text-red-300', 'Full Body': 'bg-indigo-500/20 text-indigo-300',
  Outro: 'bg-slate-500/20 text-slate-300',
};

// ─── Exercise Row ───────────────────────────────────────────────────────────
const ExerciseRow: React.FC<{
  ex: WorkoutExercise;
  onChange: (ex: WorkoutExercise) => void;
  onRemove: () => void;
}> = ({ ex, onChange, onRemove }) => (
  <div className="grid grid-cols-12 gap-2 items-center bg-slate-800/40 border border-slate-700 rounded-lg p-2">
    <div className="col-span-4">
      <input
        type="text"
        value={ex.name}
        onChange={e => onChange({ ...ex, name: e.target.value })}
        placeholder="Exercício"
        className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
      />
    </div>
    <div className="col-span-2">
      <input
        type="number"
        min={1}
        value={ex.sets}
        onChange={e => onChange({ ...ex, sets: Number(e.target.value) })}
        className="w-full bg-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
        title="Séries"
      />
    </div>
    <div className="col-span-2">
      <input
        type="text"
        value={String(ex.reps)}
        onChange={e => onChange({ ...ex, reps: e.target.value })}
        placeholder="12"
        className="w-full bg-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
        title="Reps"
      />
    </div>
    <div className="col-span-3">
      <div className="relative">
        <input
          type="number"
          min={0}
          step={0.5}
          value={ex.weight ?? ''}
          onChange={e => onChange({ ...ex, weight: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="—"
          className="w-full bg-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
          title="Peso (kg)"
        />
      </div>
    </div>
    <div className="col-span-1 flex justify-end">
      <button
        type="button"
        onClick={onRemove}
        className="p-1 rounded hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
    </div>
  </div>
);

// ─── Workout Modal ───────────────────────────────────────────────────────────
const WorkoutModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => void;
  initial?: Workout | null;
}> = ({ open, onClose, onSave, initial }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty>('moderado');
  const [duration, setDuration] = useState(60);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  React.useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? '');
      setMuscleGroups(initial.muscle_groups);
      setDifficulty(initial.difficulty);
      setDuration(initial.estimated_duration);
      setExercises(initial.exercises);
    } else {
      setName(''); setDescription(''); setMuscleGroups([]);
      setDifficulty('moderado'); setDuration(60); setExercises([]);
    }
  }, [open, initial]);

  if (!open) return null;

  const toggleMuscle = (m: MuscleGroup) =>
    setMuscleGroups(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const addExercise = () =>
    setExercises(prev => [...prev, { id: `ex-${Date.now()}`, name: '', sets: 3, reps: 12 }]);

  const updateEx = (idx: number, ex: WorkoutExercise) =>
    setExercises(prev => prev.map((e, i) => (i === idx ? ex : e)));

  const removeEx = (idx: number) =>
    setExercises(prev => prev.filter((_, i) => i !== idx));

  const canSave = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1627] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-rose-400" />
            {initial ? 'Editar Treino' : 'Novo Treino'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Treino *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Treino A – Peito e Tríceps"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Descrição (opcional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Observações sobre o treino..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>

          {/* Difficulty + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Intensidade</label>
              <div className="flex gap-1">
                {(['leve', 'moderado', 'intenso'] as WorkoutDifficulty[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${difficulty === d ? DIFFICULTY_CONFIG[d].bg : 'border-slate-700 text-slate-500 bg-slate-800/40 hover:border-slate-500'}`}
                  >
                    {DIFFICULTY_CONFIG[d].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duração estimada (min)</label>
              <input
                type="number"
                min={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Muscle Groups */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Grupos Musculares</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_MUSCLE_GROUPS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMuscle(m)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${muscleGroups.includes(m) ? `${MUSCLE_COLORS[m]} border-current` : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400">Exercícios</label>
              <div className="grid grid-cols-12 gap-2 text-[10px] text-slate-600 w-full ml-3">
                <span className="col-span-4">Nome</span>
                <span className="col-span-2 text-center">Séries</span>
                <span className="col-span-2 text-center">Reps</span>
                <span className="col-span-3 text-center">Peso (kg)</span>
              </div>
            </div>
            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <ExerciseRow
                  key={ex.id}
                  ex={ex}
                  onChange={updated => updateEx(idx, updated)}
                  onRemove={() => removeEx(idx)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addExercise}
              className="mt-2 w-full py-2 rounded-lg border border-dashed border-slate-700 text-xs text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Exercício
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:border-slate-500 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!canSave) return;
              onSave({ name, description, muscle_groups: muscleGroups, difficulty, estimated_duration: duration, exercises });
              onClose();
            }}
            disabled={!canSave}
            className="flex-1 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            Salvar Treino
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Log Modal (registrar execução) ─────────────────────────────────────────
const LogModal: React.FC<{
  open: boolean;
  workout: Workout | null;
  onClose: () => void;
  onLog: (data: Omit<WorkoutLog, 'id' | 'created_at' | 'user_id'>) => void;
}> = ({ open, workout, onClose, onLog }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState(workout?.estimated_duration ?? 60);
  const [difficultyFelt, setDifficultyFelt] = useState<WorkoutDifficulty>('moderado');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  React.useEffect(() => {
    if (workout && open) {
      setDuration(workout.estimated_duration);
      setExercises(workout.exercises.map(e => ({ ...e })));
      setNotes('');
      setDifficultyFelt('moderado');
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [workout, open]);

  if (!open || !workout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1627] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" /> Registrar Treino
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-sm text-slate-400">Treino: <span className="text-slate-200 font-medium">{workout.name}</span></p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duração real (min)</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Dificuldade sentida</label>
            <div className="flex gap-2">
              {(['leve', 'moderado', 'intenso'] as WorkoutDifficulty[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficultyFelt(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${difficultyFelt === d ? DIFFICULTY_CONFIG[d].bg : 'border-slate-700 text-slate-500 bg-slate-800/40 hover:border-slate-500'}`}
                >
                  {DIFFICULTY_CONFIG[d].label}
                </button>
              ))}
            </div>
          </div>

          {exercises.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Pesos utilizados (opcional)</label>
              <div className="space-y-2">
                {exercises.map((ex, idx) => (
                  <div key={ex.id} className="flex items-center gap-3 bg-slate-800/40 border border-slate-700 rounded-lg px-3 py-2">
                    <span className="text-xs text-slate-300 flex-1 truncate">{ex.name || `Exercício ${idx + 1}`}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={ex.weight ?? ''}
                        onChange={e => {
                          const updated = [...exercises];
                          updated[idx] = { ...ex, weight: e.target.value ? Number(e.target.value) : undefined };
                          setExercises(updated);
                        }}
                        placeholder="—"
                        className="w-16 bg-slate-700/50 rounded px-2 py-0.5 text-xs text-slate-200 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-500">kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Como foi o treino hoje?"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:border-slate-500 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => {
              onLog({
                workout_id: workout.id,
                workout_name: workout.name,
                date,
                duration_minutes: duration,
                difficulty_felt: difficultyFelt,
                notes: notes || undefined,
                exercises_done: exercises,
              });
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            ✓ Registrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Workout Card ────────────────────────────────────────────────────────────
const WorkoutCard: React.FC<{
  workout: Workout;
  logsCount: number;
  lastLogDate?: string;
  onEdit: () => void;
  onDelete: () => void;
  onLog: () => void;
}> = ({ workout, logsCount, lastLogDate, onEdit, onDelete, onLog }) => {
  const diff = DIFFICULTY_CONFIG[workout.difficulty];

  return (
    <div className="bg-[#0d1627] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm leading-tight">{workout.name}</h3>
          {workout.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{workout.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diff.bg}`}>
          {diff.label}
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> {workout.estimated_duration}min
        </span>
        {workout.muscle_groups.slice(0, 3).map(m => (
          <span key={m} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${MUSCLE_COLORS[m] ?? 'bg-slate-800 text-slate-400'}`}>
            {m}
          </span>
        ))}
        {workout.muscle_groups.length > 3 && (
          <span className="text-[10px] text-slate-500">+{workout.muscle_groups.length - 3}</span>
        )}
      </div>

      {/* Exercises count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{workout.exercises.length} exercício{workout.exercises.length !== 1 ? 's' : ''}</span>
        {lastLogDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Último: {new Date(lastLogDate + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        )}
        {logsCount > 0 && <span>{logsCount}x realizados</span>}
      </div>

      {/* CTA */}
      <button
        onClick={onLog}
        className="w-full py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
      >
        <Play className="w-3.5 h-3.5" /> Registrar Treino
      </button>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export const WorkoutsPage: React.FC = () => {
  const { workouts, logs, loading, createWorkout, updateWorkout, deleteWorkout, logWorkout, deleteLog } = useWorkouts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Workout | null>(null);
  const [logTarget, setLogTarget] = useState<Workout | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'treinos' | 'historico'>('treinos');

  const totalSessions = logs.length;
  const totalMinutes = logs.reduce((s, l) => s + l.duration_minutes, 0);
  const totalHours = Math.round(totalMinutes / 60);

  const thisWeekLogs = logs.filter(l => {
    const d = new Date(l.date);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return d >= startOfWeek;
  });

  const handleSave = (data: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => {
    if (editTarget) {
      updateWorkout(editTarget.id, data);
      setEditTarget(null);
    } else {
      createWorkout(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remover este treino?')) deleteWorkout(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-rose-400" /> Treinos
          </h2>
          <p className="text-xs text-slate-400 mt-1">Crie planos de treino, registre cargas e acompanhe sua evolução física.</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-rose-500/25 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Novo Treino
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Treinos cadastrados', value: workouts.length, icon: Dumbbell, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
          { label: 'Sessões registradas', value: totalSessions, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Horas treinadas', value: `${totalHours}h`, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
          { label: 'Treinos esta semana', value: thisWeekLogs.length, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`border rounded-2xl p-4 flex items-center gap-3 ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1 w-fit">
        {(['treinos', 'historico'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab === 'treinos' ? `Meus Treinos (${workouts.length})` : `Histórico (${logs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
        </div>
      ) : activeTab === 'treinos' ? (
        workouts.length === 0 ? (
          <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Dumbbell className="w-12 h-12 text-rose-400/40 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">Nenhum treino cadastrado</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Crie seu primeiro plano de treino para começar a registrar suas sessões.</p>
            <button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="mt-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors"
            >
              Criar Primeiro Treino
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {workouts.map(w => {
              const wLogs = logs.filter(l => l.workout_id === w.id);
              const lastLog = wLogs[0];
              return (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  logsCount={wLogs.length}
                  lastLogDate={lastLog?.date}
                  onEdit={() => { setEditTarget(w); setModalOpen(true); }}
                  onDelete={() => handleDelete(w.id)}
                  onLog={() => { setLogTarget(w); setLogModalOpen(true); }}
                />
              );
            })}
          </div>
        )
      ) : (
        /* Histórico */
        logs.length === 0 ? (
          <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <BarChart2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">Nenhuma sessão registrada</h3>
            <p className="text-xs text-slate-500">Registre sua primeira sessão de treino para ver seu histórico aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="bg-[#0d1627] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center gap-4 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{log.workout_name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(log.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.duration_minutes}min
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_CONFIG[log.difficulty_felt].bg}`}>
                      {DIFFICULTY_CONFIG[log.difficulty_felt].label}
                    </span>
                  </div>
                  {log.notes && <p className="text-xs text-slate-600 mt-1 italic truncate">{log.notes}</p>}
                </div>
                <button
                  onClick={() => { if (window.confirm('Remover este registro?')) deleteLog(log.id); }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modals */}
      <WorkoutModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
      />
      <LogModal
        open={logModalOpen}
        workout={logTarget}
        onClose={() => { setLogModalOpen(false); setLogTarget(null); }}
        onLog={logWorkout}
      />
    </div>
  );
};
