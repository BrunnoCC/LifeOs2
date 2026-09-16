import React from 'react';
import { Compass } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#081425] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 blur-3xl rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 select-none">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-lg shadow-indigo-500/20">
          <Compass className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">LifeDocs</h1>
          <p className="text-xs text-slate-400">Painel Pessoal de Organização</p>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#0d1627]/90 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl z-10">
        {children}
      </div>

      {/* Footer Note */}
      <p className="text-xs text-slate-500 mt-8">
        LifeDocs &copy; {new Date().getFullYear()} — Seu sistema pessoal de gestão e produtividade.
      </p>
    </div>
  );
};
