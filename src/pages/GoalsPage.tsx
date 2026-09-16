import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Clock,
  X,
  TrendingUp,
  Award,
  Flame,
} from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import type { Goal, GoalType } from '../types';

const GOAL_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
];

const GOAL_CATEGORIES = [
  'Saúde', 'Carreira', 'Estudos', 'Finanças',
  'Esportes', 'Pessoal', 'Relacionamento', 'Outro',
];

const TYPE_LABELS: Record<GoalType, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
  annual: 'Anual',
  custom: 'Personalizada',
};

const TYPE_COLORS: Record<GoalType, string> = {
  daily: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  weekly: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  monthly: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  annual: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  custom: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

interface GoalFormData {
  title: string;
  description: string;
  category: string;
  type: GoalType;
  current_value: number;
  target_value: number;
  unit: string;
  deadline: string;
  color: string;
}

const defaultForm: GoalFormData = {
  title: '',
  description: '',
  category: 'Pessoal',
  type: 'monthly',
  current_value: 0,
  target_value: 10,
  unit: 'vezes',
  deadline: '',
  color: GOAL_COLORS[0],
};

// Modal
const GoalModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (data: GoalFormData) => void;
  initial?: GoalFormData;
  title: string;
}> = ({ open, onClose, onSave, initial, title }) => {
  const [form, setForm] = useState<GoalFormData>(initial ?? defaultForm);

  React.useEffect(() => {
    if (open) setForm(initial ?? defaultForm);
  }, [open, initial]);

  if (!open) return null;

  const set = (k: keyof GoalFormData, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1627] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" /> {title}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Título da Meta *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex: Ler 12 livros no ano"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Descrição (opcional)</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              placeholder="Por que essa meta é importante para você?"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value as GoalType)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Progress: current + target + unit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Progresso atual</label>
              <input
                type="number"
                min={0}
                value={form.current_value}
                onChange={e => set('current_value', Number(e.target.value))}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Meta total *</label>
              <input
                type="number"
                min={1}
                value={form.target_value}
                onChange={e => set('target_value', Number(e.target.value))}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Unidade</label>
              <input
                type="text"
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                placeholder="vezes, km, h..."
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Prazo (opcional)</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d1627] scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
            onClick={() => { if (form.title.trim() && form.target_value > 0) { onSave(form); onClose(); } }}
            disabled={!form.title.trim() || form.target_value <= 0}
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            Salvar Meta
          </button>
        </div>
      </div>
    </div>
  );
};

// Goal Card
const GoalCard: React.FC<{
  goal: Goal;
  onIncrement: (id: string, amount: number) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}> = ({ goal, onIncrement, onEdit, onDelete }) => {
  const pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
  const achieved = goal.status === 'achieved';

  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div
      className={`bg-[#0d1627] border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 group ${achieved ? 'border-emerald-500/40' : 'border-slate-800 hover:border-slate-700'}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Color dot */}
          <div
            className="w-3 h-3 rounded-full mt-1 flex-shrink-0 ring-4 ring-offset-0"
            style={{ backgroundColor: goal.color, boxShadow: `0 0 10px ${goal.color}55` }}
          />
          <div className="min-w-0">
            <h3 className={`font-semibold text-sm leading-tight ${achieved ? 'text-emerald-300' : 'text-slate-100'}`}>
              {goal.title}
              {achieved && <CheckCircle2 className="inline w-4 h-4 ml-1.5 text-emerald-400" />}
            </h3>
            {goal.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{goal.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[goal.type]}`}>
          {TYPE_LABELS[goal.type]}
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          {goal.category}
        </span>
        {daysLeft !== null && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${daysLeft < 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : daysLeft <= 7 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            <Clock className="w-2.5 h-2.5" />
            {daysLeft < 0 ? 'Expirada' : daysLeft === 0 ? 'Hoje!' : `${daysLeft}d restantes`}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">
            <span className="font-bold text-slate-200">{goal.current_value}</span>
            /{goal.target_value} {goal.unit}
          </span>
          <span className={`font-bold ${achieved ? 'text-emerald-400' : 'text-slate-300'}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: achieved
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : `linear-gradient(90deg, ${goal.color}, ${goal.color}cc)`,
              boxShadow: achieved ? '0 0 8px #10b98166' : `0 0 8px ${goal.color}44`,
            }}
          />
        </div>
      </div>

      {/* Increment controls */}
      {!achieved && (
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => onIncrement(goal.id, -1)}
              disabled={goal.current_value <= 0}
              className="px-2.5 py-1.5 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-400 hover:text-slate-200"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1.5 text-xs font-mono text-slate-300 border-x border-slate-700">
              {goal.current_value}
            </span>
            <button
              onClick={() => onIncrement(goal.id, 1)}
              className="px-2.5 py-1.5 hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => onIncrement(goal.id, 5)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
          >
            +5
          </button>
          <button
            onClick={() => onIncrement(goal.id, 10)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
          >
            +10
          </button>
        </div>
      )}

      {achieved && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
          <Award className="w-4 h-4" />
          <span>Meta alcançada! 🎉</span>
        </div>
      )}
    </div>
  );
};

export const GoalsPage: React.FC = () => {
  const { goals, loading, createGoal, updateGoal, deleteGoal, incrementGoal } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Goal | null>(null);
  const [filterType, setFilterType] = useState<'all' | GoalType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'achieved'>('all');

  const handleSave = (data: GoalFormData) => {
    if (editTarget) {
      updateGoal(editTarget.id, {
        ...data,
        status: data.current_value >= data.target_value ? 'achieved' : 'in_progress',
      });
      setEditTarget(null);
    } else {
      createGoal({
        ...data,
        status: data.current_value >= data.target_value ? 'achieved' : 'in_progress',
      });
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditTarget(goal);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remover esta meta?')) deleteGoal(id);
  };

  const filteredGoals = goals.filter(g => {
    if (filterType !== 'all' && g.type !== filterType) return false;
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const total = goals.length;
  const achieved = goals.filter(g => g.status === 'achieved').length;
  const inProgress = goals.filter(g => g.status === 'in_progress').length;
  const avgPct = total > 0
    ? Math.round(goals.reduce((acc, g) => acc + Math.min(100, (g.current_value / g.target_value) * 100), 0) / total)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" /> Metas &amp; Objetivos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Defina e acompanhe metas diárias, semanais e anuais com progresso visual.
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Meta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total de Metas', value: total, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Em Progresso', value: inProgress, icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
          { label: 'Concluídas', value: achieved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Progresso Médio', value: `${avgPct}%`, icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`border rounded-2xl p-4 flex items-center gap-3 ${bg}`}>
            <div className={`p-2 rounded-xl bg-current/10 ${color}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1">
          {(['all', 'in_progress', 'achieved'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {s === 'all' ? 'Todas' : s === 'in_progress' ? 'Em Progresso' : 'Concluídas'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1 flex-wrap">
          {(['all', 'daily', 'weekly', 'monthly', 'annual', 'custom'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterType === t ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {t === 'all' ? 'Tipo: Todos' : TYPE_LABELS[t as GoalType]}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Target className="w-12 h-12 text-indigo-400/40 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">
            {goals.length === 0 ? 'Nenhuma meta criada' : 'Nenhuma meta nessa categoria'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {goals.length === 0
              ? 'Crie sua primeira meta e comece a acompanhar seu progresso.'
              : 'Tente alterar os filtros para ver outras metas.'}
          </p>
          {goals.length === 0 && (
            <button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Criar Primeira Meta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onIncrement={incrementGoal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <GoalModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        title={editTarget ? 'Editar Meta' : 'Nova Meta'}
        initial={editTarget ? {
          title: editTarget.title,
          description: editTarget.description ?? '',
          category: editTarget.category,
          type: editTarget.type,
          current_value: editTarget.current_value,
          target_value: editTarget.target_value,
          unit: editTarget.unit,
          deadline: editTarget.deadline ?? '',
          color: editTarget.color,
        } : undefined}
      />
    </div>
  );
};
