import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config/api';
import { 
  LogIn, UserPlus, AlertCircle, Eye, EyeOff, 
  CheckCircle2, ShieldCheck, Zap, Sparkles 
} from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const loginStore = useAuthStore((state: any) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas autoryzacji.');
      }

      if (isLogin) {
        loginStore(data.user, data.token);
        navigate('/');
      } else {
        setSuccess('Konto i Twój kanał zostały pomyślnie utworzone! Możesz się teraz zalogować.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Brak połączenia z serwerem API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[var(--bg-base)] overflow-y-auto select-none">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Neon Pasek na Górze */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500"></div>

        {/* Logo i Nagłówek */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <span className="font-display font-black text-2xl text-white">
              Aura<span className="text-[var(--brand-primary)]">Cast</span>
            </span>
          </Link>
          <p className="text-xs text-gray-400">
            {isLogin 
              ? 'Witaj ponownie! Zaloguj się, aby czatować i obserwować.' 
              : 'Stwórz bezpłatne konto i otrzymaj natychmiast własny kanał ze streamem.'}
          </p>
        </div>

        {/* Przełącznik Zakładek */}
        <div className="flex p-1 bg-[#0c1015] border border-[var(--border-subtle)] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isLogin 
                ? 'bg-[var(--brand-primary)] text-white shadow-md font-extrabold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Zaloguj się</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !isLogin 
                ? 'bg-[var(--brand-primary)] text-white shadow-md font-extrabold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Zarejestruj się</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                Nazwa użytkownika (Twój kanał)
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="np. NinjaPro"
                required
                className="w-full bg-[var(--bg-input)] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
              Adres E-mail
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.com"
              required
              className="w-full bg-[var(--bg-input)] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
              Hasło
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[var(--bg-input)] text-white text-xs sm:text-sm px-4 py-2.5 pr-10 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[var(--brand-primary)] hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Przetwarzanie...</span>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Zaloguj się</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Utwórz bezpłatne konto</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] space-y-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>100% zysków trafia bezpośrednio do twórców (BYOM)</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Błyskawiczny czat WebSocket bez opóźnień</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Własny serwer RTMP i kompatybilność z OBS</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;