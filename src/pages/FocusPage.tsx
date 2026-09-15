import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

export const FocusPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'work') {
        setCompletedSessions(prev => prev + 1);
        setMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') setTimeLeft(25 * 60);
    else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center py-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-indigo-400" /> Modo Foco / Pomodoro
        </h2>
        <p className="text-xs text-slate-400 mt-1">Elimine distrações e concentre-se em blocos de alta produtividade.</p>
      </div>

      {/* Mode Switches */}
      <div className="inline-flex items-center gap-2 p-1.5 bg-[#0d1627] border border-slate-800 rounded-2xl">
        <button
          onClick={() => switchMode('work')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'work' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Foco (25m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pausa Curta (5m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'longBreak' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pausa Longa (15m)
        </button>
      </div>

      {/* Timer Display */}
      <div className="bg-[#0d1627] border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="text-6xl sm:text-7xl font-extrabold text-slate-100 font-mono tracking-tight tabular-nums">
          {formatTime(timeLeft)}
        </div>

        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          {mode === 'work' ? '🔥 Bloco de Foco Ativo' : '☕ Tempo de Descanso'}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          
          <button
            onClick={resetTimer}
            title="Reiniciar timer"
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="p-4 bg-[#0d1627] border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300">
        <span className="text-slate-400">Sessões concluídas hoje:</span>
        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{completedSessions} blocos</span>
        </div>
      </div>
    </div>
  );
};
