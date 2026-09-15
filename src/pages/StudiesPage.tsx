import React, { useState } from 'react';
import { useStudies } from '../hooks/useStudies';
import type { StudySubject } from '../types';
import { 
  BookOpen, 
  Plus, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Trash2, 
  Award,
  X 
} from 'lucide-react';

export const StudiesPage: React.FC = () => {
  const { 
    subjects, 
    sessions, 
    totalMinutes, 
    totalQuestions, 
    totalCorrect, 
    accuracyRate, 
    createSubject, 
    deleteSubject, 
    createSession, 
    deleteSession 
  } = useStudies();

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Subject Form State
  const [subjectName, setSubjectName] = useState('');
  const [subjectCategory, setSubjectCategory] = useState('Faculdade');
  const [targetHours, setTargetHours] = useState(50);
  const [difficulty, setDifficulty] = useState<'fácil' | 'médio' | 'difícil'>('médio');

  // Session Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [questionsSolved, setQuestionsSolved] = useState(10);
  const [questionsCorrect, setQuestionsCorrect] = useState(8);
  const [sessionNotes, setSessionNotes] = useState('');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    createSubject({
      name: subjectName,
      category: subjectCategory,
      target_hours: Number(targetHours),
      difficulty,
      color: '#34d399'
    });

    setSubjectName('');
    setIsSubjectModalOpen(false);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    const subj = subjects.find(s => s.id === selectedSubjectId);
    if (!subj) return;

    createSession({
      subject_id: selectedSubjectId,
      subject_name: subj.name,
      date: sessionDate,
      duration_minutes: Number(durationMinutes),
      questions_solved: Number(questionsSolved),
      questions_correct: Number(questionsCorrect),
      notes: sessionNotes
    });

    setSessionNotes('');
    setIsSessionModalOpen(false);
  };

  const hoursDisplay = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" /> Gestão de Estudos
          </h2>
          <p className="text-xs text-slate-400 mt-1">Cadastre disciplinas, registre sessões de estudo e acompanhe sua taxa de acerto.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
          >
            + Nova Matéria
          </button>
          <button
            onClick={() => {
              if (subjects.length > 0) {
                setSelectedSubjectId(subjects[0].id);
              }
              setIsSessionModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" /> Registrar Sessão
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1627] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Tempo Estudado</p>
            <p className="text-2xl font-extrabold text-slate-100 tabular-nums">{hoursDisplay}h</p>
          </div>
        </div>

        <div className="bg-[#0d1627] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Questões Realizadas</p>
            <p className="text-2xl font-extrabold text-slate-100 tabular-nums">{totalQuestions}</p>
          </div>
        </div>

        <div className="bg-[#0d1627] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Taxa de Acerto</p>
            <p className="text-2xl font-extrabold text-emerald-400 tabular-nums">{accuracyRate}%</p>
          </div>
        </div>
      </div>

      {/* Subjects Cards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Matérias & Disciplinas ({subjects.length})</h3>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Nenhuma matéria cadastrada.</p>
            <p className="text-[11px] text-slate-500 mt-1">Cadastre disciplinas como "Cálculo", "Programação" ou "Inglês".</p>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              + Cadastrar Matéria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map(subj => {
              const subjSessions = sessions.filter(s => s.subject_id === subj.id);
              const subjMinutes = subjSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
              const subjHours = (subjMinutes / 60).toFixed(1);
              const pctTarget = Math.min(Math.round((Number(subjHours) / (subj.target_hours || 1)) * 100), 100);

              return (
                <div key={subj.id} className="bg-[#0d1627] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{subj.name}</h4>
                        <span className="text-[10px] text-slate-400">{subj.category}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        subj.difficulty === 'difícil' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        subj.difficulty === 'médio' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {subj.difficulty}
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between text-xs text-slate-300">
                      <span>Progresso:</span>
                      <span className="font-bold text-emerald-400 tabular-nums">{subjHours}h / {subj.target_hours}h</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pctTarget}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-800">
                    <button onClick={() => deleteSubject(subj.id)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sessions Log Table */}
      <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Histórico de Sessões de Estudo ({sessions.length})</h3>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Nenhuma sessão registrada. Clique em "+ Registrar Sessão" acima.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(sess => (
              <div key={sess.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <p className="font-bold text-slate-100">{sess.subject_name}</p>
                  <p className="text-[10px] text-slate-400">{sess.date} &bull; {sess.duration_minutes} minutos</p>
                  {sess.notes && <p className="text-[11px] text-slate-400 mt-0.5">{sess.notes}</p>}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-emerald-400">{sess.questions_correct} / {sess.questions_solved} questões</p>
                    <p className="text-[10px] text-slate-500">{sess.questions_solved > 0 ? Math.round((sess.questions_correct / sess.questions_solved) * 100) : 0}% acerto</p>
                  </div>
                  <button onClick={() => deleteSession(sess.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1627] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Nova Matéria / Disciplina</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Matéria</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Ex: Programação React, Cálculo 1, Inglês"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={subjectCategory}
                    onChange={(e) => setSubjectCategory(e.target.value)}
                    placeholder="Ex: Faculdade, Concurso"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Meta de Horas</label>
                  <input
                    type="number"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dificuldade</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="fácil">Fácil</option>
                  <option value="médio">Médio</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white"
                >
                  Salvar Matéria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SESSION MODAL */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1627] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Registrar Sessão de Estudo</h3>
              <button onClick={() => setIsSessionModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Matéria</label>
                {subjects.length === 0 ? (
                  <p className="text-xs text-red-400">Cadastre uma matéria primeiro.</p>
                ) : (
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Questões Resolvidas</label>
                  <input
                    type="number"
                    value={questionsSolved}
                    onChange={(e) => setQuestionsSolved(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Acertos</label>
                  <input
                    type="number"
                    value={questionsCorrect}
                    onChange={(e) => setQuestionsCorrect(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Ex: Leitura dos capítulos 3 e 4"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subjects.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                >
                  Salvar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
