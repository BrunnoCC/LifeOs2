import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { User, Shield, LogOut, Save, Trash2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuthContext();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [theme] = useState(user?.theme || 'dark');
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      theme: theme as any
    });
    setMessage('Perfil atualizado com sucesso!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados salvos localmente? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" /> Perfil & Configurações
        </h2>
        <p className="text-xs text-slate-400 mt-1">Gerencie suas preferências de conta e dados pessoais.</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium">
          {message}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{user?.full_name || 'Usuário'}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-semibold">
              Persistência Local JSON Ativa
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Exibido</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-950 border border-slate-800/60 text-slate-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#0d1627] border border-red-500/20 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Zona de Segurança
        </h3>
        <p className="text-xs text-slate-400">Você pode redefinir o banco de dados local caso queira zerar o sistema.</p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Zerar Todos os Dados Locais
          </button>
        </div>
      </div>
    </div>
  );
};
