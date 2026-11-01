import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config/api';
import { 
  Save, Video, Gamepad2, Key, Check, Copy, Eye, EyeOff, 
  Radio, Users, DollarSign, Activity, ExternalLink, HelpCircle, AlertCircle, Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state: any) => state.user);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Just Chatting');
  const [bannerUrl, setBannerUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [keyStatus, setKeyStatus] = useState('Pobieranie klucza...');
  const [status, setStatus] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchMyChannel = async () => {
      try {
        const res = await fetch(`${API_URL}/api/channels/private/${user.username}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || `Live u ${user.username}`);
          setCategory(data.current_category || 'Just Chatting');
          setBannerUrl(data.offline_banner || '');
          setStreamKey(data.stream_key || '');
          setKeyStatus('');
        } else {
          setKeyStatus('Błąd: Nie znaleziono kanału.');
        }
      } catch (err) {
        setStreamKey(`live_${user.username}_local`);
        setKeyStatus('');
      }
    };

    fetchMyChannel();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Zapisywanie...');

    try {
      const res = await fetch(`${API_URL}/api/channels/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.username,
          title,
          current_category: category,
          offline_banner: bannerUrl
        })
      });

      if (res.ok) {
        setStatus('Ustawienia zapisane pomyślnie!');
      } else {
        setStatus('Błąd podczas zapisywania.');
      }
    } catch (err) {
      setStatus('Zapisano lokalnie!');
    }

    setTimeout(() => setStatus(''), 3000);
  };

  const handleCopyKey = () => {
    if (streamKey) {
      navigator.clipboard.writeText(streamKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('rtmp://localhost/live');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-base)]">
        <AlertCircle className="w-12 h-12 text-[var(--brand-primary)] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Musisz być zalogowany</h2>
        <p className="text-sm text-gray-400 mb-6">Zaloguj się, aby uzyskać dostęp do Panelu Twórcy.</p>
        <Link to="/auth" className="bg-[var(--brand-primary)] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition-colors">
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-[var(--bg-base)] select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 🟢 GÓRNY PASEK PANELU */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-display">
                Menedżer Streamu
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-600/40">
                CREATOR STUDIO
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Zarządzaj swoją transmisją, konfiguruj OBS i monitoruj statystyki w czasie rzeczywistym.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/${user.username}`}
              className="px-4 py-2 rounded-xl bg-[#151c26] hover:bg-[#1d2735] text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-[var(--border-subtle)]"
            >
              <span>Zobacz Mój Kanał</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 🟢 STATYSTYKI NA ŻYWO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Status Live</span>
              <Radio className={`w-4 h-4 ${isLive ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
            </div>
            <p className="text-lg font-black text-white flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-red-500' : 'bg-gray-500'}`}></span>
              <span>{isLive ? 'NA ŻYWO' : 'OFFLINE'}</span>
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Widzowie</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-lg font-black text-white">
              {isLive ? '1,204' : '0'}
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Jakość Bitrate</span>
              <Activity className="w-4 h-4 text-[var(--brand-primary)]" />
            </div>
            <p className="text-lg font-black text-white">
              {isLive ? '6,000 kbps' : 'Brak sygnału'}
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">BYOM Monetyzacja</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-lg font-black text-blue-400">
              100% dla Ciebie
            </p>
          </div>
        </div>

        {/* 🟢 GŁÓWNA SIATKA USTAWIEŃ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Formularz Informacji o Streamie */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-[var(--brand-primary)]" />
                <span>Edycja Informacji o Transmisji</span>
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Tytuł Streamu
                  </label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Wpisz chwytliwy tytuł transmisji..."
                    className="w-full bg-[var(--bg-input)] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block mb-1.5 flex items-center gap-1.5">
                      <Gamepad2 className="w-4 h-4 text-blue-400" />
                      <span>Kategoria / Gra</span>
                    </label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[var(--bg-input)] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none transition-colors cursor-pointer"
                    >
                      <option value="Just Chatting">Just Chatting</option>
                      <option value="Counter-Strike 2">Counter-Strike 2</option>
                      <option value="Grand Theft Auto V">Grand Theft Auto V</option>
                      <option value="Valorant">Valorant</option>
                      <option value="Minecraft">Minecraft</option>
                      <option value="Programowanie">Programowanie</option>
                      <option value="Technologia">Technologia</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block mb-1.5">
                      Język Transmisji
                    </label>
                    <input 
                      type="text" 
                      readOnly 
                      value="Polski (PL)"
                      className="w-full bg-[#0e1319] text-gray-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Baner Offline (Link do grafiki)
                  </label>
                  <input 
                    type="text" 
                    value={bannerUrl} 
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://example.com/moj-baner.png"
                    className="w-full bg-[var(--bg-input)] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none transition-colors"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[var(--border-subtle)]">
                  <span className={`text-xs font-bold ${status.includes('Błąd') ? 'text-red-400' : 'text-blue-400'}`}>
                    {status}
                  </span>

                  <button
                    type="submit"
                    className="bg-[var(--brand-primary)] hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Zapisz Zmiany</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Konfiguracja OBS Studio & RTMP Server */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-400" />
                  <span>Klucz Strumienia i Konfiguracja OBS</span>
                </h2>
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  RTMP Port 1935
                </span>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Adres URL Serwera (Wpisz w OBS: Serwer)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value="rtmp://localhost/live"
                    className="flex-1 bg-[#0e1319] px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs text-gray-300 font-mono outline-none"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2 rounded-xl bg-[#18202c] hover:bg-[#202c3d] text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Skopiowano' : 'Kopiuj'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Klucz Strumienia (Wpisz w OBS: Klucz)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type={showKey ? 'text' : 'password'} 
                      readOnly 
                      value={streamKey || keyStatus}
                      className="w-full bg-[#0e1319] px-3.5 py-2.5 pr-10 rounded-xl border border-[var(--border-subtle)] text-xs text-blue-400 font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                      title={showKey ? "Ukryj klucz" : "Pokaż klucz"}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={handleCopyKey}
                    disabled={!streamKey}
                    className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Skopiowano' : 'Kopiuj'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  ⚠️ Nigdy nie pokazuj tego klucza na streamie! Każdy kto go posiada, może nadawać na Twoim kanale.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e131a] border border-[var(--border-subtle)] text-xs text-gray-300 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  Jak uruchomić stream w OBS Studio?
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-400 text-[11px]">
                  <li>Otwórz <b>OBS Studio</b> i wejdź w: <i>Ustawienia → Transmisja</i>.</li>
                  <li>Wybierz <b>Usługa: Własna... (Custom...)</b>.</li>
                  <li>W pole <b>Serwer</b> wklej: <code className="text-blue-400 font-mono">rtmp://localhost/live</code></li>
                  <li>W pole <b>Klucz strumienia</b> wklej: <code className="text-blue-400 font-mono">{user?.username}</code> (lub wygenerowany klucz powyżej).</li>
                  <li>Kliknij <b>Rozpocznij transmisję</b>. Twój kanał stanie się automatycznie <b>NA ŻYWO</b>!</li>
                </ol>
              </div>

            </div>

          </div>

          {/* Prawa kolumna */}
          <div className="space-y-6">
            
            {/* Monitor Podglądu */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-extrabold text-white mb-3 flex items-center justify-between">
                <span>Podgląd Transmisji</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isLive ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {isLive ? 'ONLINE' : 'OFFLINE'}
                </span>
              </h3>

              <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center border border-[var(--border-subtle)]">
                {isLive ? (
                  <div className="text-center text-xs text-blue-400 font-bold">
                    Transmisja aktywna
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Radio className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 font-semibold">Oczekiwanie na sygnał z OBS...</p>
                    <p className="text-[10px] text-gray-500 mt-1">Uruchom nadawanie w programie streamingowym</p>
                  </div>
                )}
              </div>
            </div>

            {/* Szybkie Narzędzia Twórcy (bez subów!) */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl space-y-2.5">
              <h3 className="text-sm font-extrabold text-white mb-2">
                Narzędzia Czatowe
              </h3>
              
              <button 
                onClick={() => setIsLive(!isLive)}
                className="w-full text-left p-2.5 rounded-xl bg-[#141b24] hover:bg-[#1a2330] text-xs font-bold text-gray-200 flex items-center justify-between border border-[var(--border-subtle)] transition-colors"
              >
                <span>Symuluj status Live (Test)</span>
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500' : 'bg-gray-500'}`}></span>
              </button>

              <button className="w-full text-left p-2.5 rounded-xl bg-[#141b24] hover:bg-[#1a2330] text-xs font-bold text-gray-200 flex items-center justify-between border border-[var(--border-subtle)] transition-colors">
                <span>Wyczyść wiadomości czatu</span>
                <span className="text-[10px] text-gray-400">Mod</span>
              </button>

              <button className="w-full text-left p-2.5 rounded-xl bg-[#141b24] hover:bg-[#1a2330] text-xs font-bold text-gray-200 flex items-center justify-between border border-[var(--border-subtle)] transition-colors">
                <span>Tryb tylko dla obserwujących</span>
                <span className="text-[10px] text-blue-400">Followers-Only</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;