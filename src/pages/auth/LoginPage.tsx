import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, loginWithGoogle, resetPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor informe seu e-mail.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await login(email, password);
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await loginWithGoogle();
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com o Google.');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor informe seu e-mail para redefinir a senha.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await resetPassword(email);
      if (res.error) {
        setError(res.error);
      } else if (res.successMessage) {
        setSuccessMessage(res.successMessage);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar redefinição de senha.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isResetting) {
    return (
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Recuperar Senha</h2>
        <p className="text-xs text-slate-400 mb-6">Informe seu e-mail para receber as instruções de redefinição.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail cadastrado</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-98 disabled:opacity-50"
          >
            <span>{submitting ? 'Enviando...' : 'Enviar Link de Redefinição'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => {
              setIsResetting(false);
              setError(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-1">Entrar no LifeDocs</h2>
      <p className="text-xs text-slate-400 mb-6">Acesse seu painel pessoal de rotina e produtividade.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleSubmitting || submitting}
        className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 mb-4 shadow-sm"
      >
        <GoogleIcon />
        <span>{googleSubmitting ? 'Conectando ao Google...' : 'Entrar com o Google'}</span>
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="bg-[#0d1627] px-3 text-slate-500 font-medium">ou entre com e-mail</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">Senha</label>
            <button
              type="button"
              onClick={() => {
                setIsResetting(true);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Esqueceu sua senha?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || googleSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-98 disabled:opacity-50"
        >
          <span>{submitting ? 'Entrando...' : 'Acessar o Sistema'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Ainda não possui conta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
};
