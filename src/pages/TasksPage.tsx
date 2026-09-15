import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import type { TaskPriority, TaskStatus } from '../types';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  CheckCircle2, 
  Trash2, 
  X
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { tasks, createTask, updateTask, deleteTask, toggleTaskStatus, toggleSubtask } = useTasks();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'kanban' | 'all'>('today');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState('Geral');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtaskInputList, setSubtaskInputList] = useState<string[]>([]);

  const todayISO = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }
    if (activeTab === 'today') {
      return task.date === todayISO || !task.date;
    } else if (activeTab === 'upcoming') {
      return task.date && task.date > todayISO;
    } else if (activeTab === 'overdue') {
      return task.date && task.date < todayISO && task.status !== 'completed';
    }
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      title,
      description,
      priority,
      status: 'pending',
      category,
      date,
      time: time || undefined,
      recurrence: 'none',
      subtasks: subtaskInputList.map((t, idx) => ({ id: `sub-${idx}`, title: t, completed: false })),
      tags: [category]
    });

    setTitle('');
    setDescription('');
    setPriority('normal');
    setSubtaskInputList([]);
    setIsModalOpen(false);
  };

  const handleAddSubtaskInput = () => {
    if (newSubtaskTitle.trim()) {
      setSubtaskInputList([...subtaskInputList, newSubtaskTitle.trim()]);
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" /> Gestão de Tarefas
          </h2>
          <p className="text-xs text-slate-400 mt-1">Organize suas demandas com prioridades, datas e subtarefas.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'upcoming', label: 'Próximas' },
            { id: 'overdue', label: 'Atrasadas' },
            { id: 'kanban', label: 'Kanban' },
            { id: 'all', label: 'Todas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar tarefa..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Priority Select */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">Todas as prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="normal">Normal</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* Main View Display */}
      {activeTab === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { status: 'pending', title: 'Pendente', color: 'border-amber-500/30 text-amber-400' },
            { status: 'in_progress', title: 'Em Andamento', color: 'border-indigo-500/30 text-indigo-400' },
            { status: 'completed', title: 'Concluída', color: 'border-emerald-500/30 text-emerald-400' }
          ].map(col => {
            const colTasks = tasks.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="bg-[#0d1627] border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.title}</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-mono">{colTasks.length}</span>
                </div>
                <div className="space-y-3 flex-1">
                  {colTasks.map(t => (
                    <div key={t.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200">{t.title}</p>
                        <button onClick={() => deleteTask(t.id)} className="text-slate-500 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {t.description && <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{t.date || 'Sem data'}</span>
                        <select
                          value={t.status}
                          onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                        >
                          <option value="pending">Pendente</option>
                          <option value="in_progress">Em Andamento</option>
                          <option value="completed">Concluída</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-12 text-center">
              <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">Nenhuma tarefa encontrada</h3>
              <p className="text-xs text-slate-500 mt-1">Crie sua primeira tarefa para organizar sua rotina diária.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                + Criar Tarefa
              </button>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-[#0d1627] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-all ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-400 bg-slate-950'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <div className="space-y-1">
                    <p className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </p>
                    {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                    
                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-2 space-y-1 pl-2 border-l-2 border-slate-800">
                        {task.subtasks.map(sub => (
                          <div key={sub.id} className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => toggleSubtask(task.id, sub.id)}
                              className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                            />
                            <span className={sub.completed ? 'line-through text-slate-500' : 'text-slate-300'}>{sub.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                    task.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    task.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {task.priority}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1627] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Nova Tarefa</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Estudar 2h de React"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição (opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes da tarefa..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Estudos, Trabalho"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário (opcional)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Subtasks input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subtarefas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Adicionar etapa..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtaskInput}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl text-slate-200"
                  >
                    + Adicionar
                  </button>
                </div>
                {subtaskInputList.length > 0 && (
                  <div className="space-y-1 pl-2">
                    {subtaskInputList.map((st, i) => (
                      <p key={i} className="text-xs text-slate-400">• {st}</p>
                    ))}
                  </div>
                )}
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-600/20"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
