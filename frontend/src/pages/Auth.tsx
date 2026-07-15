import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Pola formularza
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Stany poboczne
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Błąd połączenia z serwerem');
      }

      if (isLogin) {
        // Logowanie udane - wrzucamy do Zustanda i przenosimy na główną
        loginStore(data.user, data.token);
        navigate('/');
      } else {
        // Rejestracja udana - przełączamy na widok logowania
        setIsLogin(true);
        setPassword('');
        alert('Konto i Twój kanał zostały utworzone! Zaloguj się.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0f0f13] p-4 h-full">
      <div className="bg-[#18181b] p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Dekoracyjny pasek na górze */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Witaj z powrotem!' : 'Dołącz do AuraCast'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? 'Zaloguj się, aby rozmawiać i streamować.' : 'Stwórz konto i odbierz swój klucz streamu.'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-6 text-sm border border-red-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Nazwa użytkownika</label>
              <input 
                type="text" value={username} onChange={e => setUsername(e.target.value)} 
                className="w-full bg-[#27272a] text-white px-4 py-2.5 rounded-lg border border-transparent focus:border-blue-500 outline-none transition-colors" 
                placeholder="Twój nick" required 
              />
            </div>
          )}
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Adres E-mail</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)} 
              className="w-full bg-[#27272a] text-white px-4 py-2.5 rounded-lg border border-transparent focus:border-blue-500 outline-none transition-colors" 
              placeholder="adres@email.com" required 
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Hasło</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)} 
              className="w-full bg-[#27272a] text-white px-4 py-2.5 rounded-lg border border-transparent focus:border-blue-500 outline-none transition-colors" 
              placeholder="••••••••" required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-2 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? 'Przetwarzanie...' : (isLogin ? 'Zaloguj się' : 'Zarejestruj konto')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-gray-400 text-sm hover:text-blue-400 transition-colors"
          >
            {isLogin ? 'Nie masz konta? Zarejestruj się.' : 'Masz już konto? Zaloguj się.'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Auth;