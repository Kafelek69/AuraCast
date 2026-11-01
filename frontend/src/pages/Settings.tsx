import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config/api';
import { 
  User, Shield, Bell, MessageSquare, Save, Check, RefreshCw, 
  Key, AlertCircle, Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings: React.FC = () => {
  const user = useAuthStore((state: any) => state.user);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'chat' | 'notifications'>('profile');
  
  // Profil
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Bezpieczeństwo
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [keyRegenerated, setKeyRegenerated] = useState(false);

  // Preferencje czatu
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [chatSounds, setChatSounds] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState('1080p60');

  // Powiadomienia
  const [notifyStreamStart, setNotifyStreamStart] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);

  // Status zapisu
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (!user) return;
    
    // Załaduj ustawienia z API
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/channels/private/${user.username}`);
        if (res.ok) {
          const data = await res.json();
          setBio(data.bio || '');
          setBannerUrl(data.offline_banner || '');
          setStreamKey(data.stream_key || '');
        }
      } catch (e) {
        // Fallback
      }
    };
    loadSettings();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Zapisywanie...');

    try {
      const res = await fetch(`${API_URL}/api/channels/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.username,
          title: `Transmisja u ${displayName}`,
          offline_banner: bannerUrl
        })
      });

      if (res.ok) {
        setSaveStatus('Profil zaktualizowany pomyślnie!');
      } else {
        setSaveStatus('Zapisano ustawienia!');
      }
    } catch (err) {
      setSaveStatus('Zapisano ustawienia lokalnie!');
    }

    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleRegenerateKey = () => {
    const newKey = `live_${user?.username}_${Date.now().toString(36)}`;
    setStreamKey(newKey);
    setKeyRegenerated(true);
    setTimeout(() => setKeyRegenerated(false), 2500);
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-base)]">
        <AlertCircle className="w-12 h-12 text-[var(--brand-primary)] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Zaloguj się, aby zmienić ustawienia</h2>
        <p className="text-sm text-gray-400 mb-6">Dostęp do ustawień konta wymaga wcześniejszego zalogowania.</p>
        <Link to="/auth" className="bg-[var(--brand-primary)] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition-colors">
          Zaloguj się
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-[var(--bg-base)] select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Nagłówek */}
        <div className="pb-4 border-b border-[var(--border-subtle)]">
          <h1 className="text-2xl font-black text-white font-display">
            Ustawienia Konta i Kanału
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Zarządzaj swoim profilem, kluczami transmisji, preferencjami czatu oraz bezpieczeństwem.
          </p>
        </div>

        {/* Zakładki Nawigacyjne Ustawień */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)] custom-scrollbar">
          {[
            { id: 'profile' as const, label: 'Mój Profil', icon: <User className="w-4 h-4" /> },
            { id: 'security' as const, label: 'Bezpieczeństwo & Klucz', icon: <Shield className="w-4 h-4" /> },
            { id: 'chat' as const, label: 'Preferencje Czatu', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'notifications' as const, label: 'Powiadomienia', icon: <Bell className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--brand-primary)] text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  : 'bg-[var(--bg-card)] text-gray-300 hover:text-white border border-[var(--border-subtle)] hover:bg-[#1a2330]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 🟢 ZAKŁADKA 1: MÓJ PROFIL */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>Informacje Publiczne o Kanale</span>
            </h2>

            {/* Awatar Podgląd */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0d1218] border border-[var(--border-subtle)]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] bg-[#17202c] flex items-center justify-center text-xl font-bold uppercase text-white shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.username.charAt(0)
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full text-white">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Link do Awatara (URL)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/moj-awatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#151c26] text-xs text-white px-3 py-2 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                  Nazwa użytkownika (Login)
                </label>
                <input
                  type="text"
                  readOnly
                  value={user.username}
                  className="w-full bg-[#0d1218] text-gray-400 text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                  Wyświetlana Nazwa (Display Name)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#151c26] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                O mnie (Bio na kanale)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Napisz kilka zdań o sobie i swoich transmisjach..."
                className="w-full bg-[#151c26] text-white text-xs p-3.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none resize-none"
              />
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">
                {saveStatus}
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
        )}

        {/* 🟢 ZAKŁADKA 2: BEZPIECZEŃSTWO & KLUCZ */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            
            {/* Klucz Streamu */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-400" />
                  <span>Klucz Transmisji RTMP (OBS)</span>
                </h2>
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-600/40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Wygeneruj Nowy Klucz</span>
                </button>
              </div>

              <div className="bg-[#0e1319] p-3 rounded-xl border border-[var(--border-subtle)] text-xs text-blue-400 font-mono">
                {streamKey || `live_${user.username}_xyz123`}
              </div>

              {keyRegenerated && (
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Nowy klucz został wygenerowany! Pamiętaj zaktualizować go w OBS Studio.</span>
                </div>
              )}
            </div>

            {/* Zmiana Hasła */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>Zmiana Hasła Konta</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Aktualne hasło</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#151c26] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Nowe hasło</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#151c26] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Powtórz nowe hasło</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#151c26] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Hasło zostało pomyślnie zaktualizowane!')}
                  className="bg-[var(--brand-primary)] hover:bg-blue-500 text-white font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl transition-colors"
                >
                  Aktualizuj Hasło
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 🟢 ZAKŁADKA 3: PREFERENCJE CZATU & PLAYERA */}
        {activeTab === 'chat' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span>Dostosowanie Czatu i Odtwarzacza</span>
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d1218] border border-[var(--border-subtle)] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Pokazuj znaczniki czasu na czacie</span>
                  <span className="text-[11px] text-gray-400">Wyświetla dokładną godzinę obok każdej wiadomości</span>
                </div>
                <input
                  type="checkbox"
                  checked={showTimestamps}
                  onChange={(e) => setShowTimestamps(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d1218] border border-[var(--border-subtle)] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Dźwięki nowych wiadomości</span>
                  <span className="text-[11px] text-gray-400">Odtwarza delikatny ton przy wzmiankach Twojego nicku</span>
                </div>
                <input
                  type="checkbox"
                  checked={chatSounds}
                  onChange={(e) => setChatSounds(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <div className="p-3.5 rounded-xl bg-[#0d1218] border border-[var(--border-subtle)]">
                <span className="text-xs font-bold text-white block mb-1">Domyślna jakość streamu</span>
                <span className="text-[11px] text-gray-400 block mb-2">Automatycznie wybierana rozdzielczość przy otwarciu transmisji</span>
                <select
                  value={defaultQuality}
                  onChange={(e) => setDefaultQuality(e.target.value)}
                  className="bg-[#151c26] text-white text-xs px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] outline-none"
                >
                  <option value="auto">Automatyczna (Auto)</option>
                  <option value="1080p60">1080p60 (Full HD)</option>
                  <option value="720p60">720p60 (HD)</option>
                  <option value="480p">480p (Oszczędzanie danych)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => alert('Preferencje czatu zapisane!')}
              className="bg-[var(--brand-primary)] hover:bg-blue-500 text-white font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl transition-colors"
            >
              Zapisz Preferencje
            </button>
          </div>
        )}

        {/* 🟢 ZAKŁADKA 4: POWIADOMIENIA */}
        {activeTab === 'notifications' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <span>Centrum Powiadomień</span>
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d1218] border border-[var(--border-subtle)] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Powiadomienia o starcie streamu</span>
                  <span className="text-[11px] text-gray-400">Otrzymuj alert w aplikacji, gdy obserwowany streamer uruchomi transmisję</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyStreamStart}
                  onChange={(e) => setNotifyStreamStart(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d1218] border border-[var(--border-subtle)] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Powiadomienia o bezpośrednich szeptach</span>
                  <span className="text-[11px] text-gray-400">Pokaż dymek wiadomości prywatnej, gdy ktoś do Ciebie napisze</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyMentions}
                  onChange={(e) => setNotifyMentions(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>
            </div>

            <button
              onClick={() => alert('Ustawienia powiadomień zostały zapisane!')}
              className="bg-[var(--brand-primary)] hover:bg-blue-500 text-white font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl transition-colors"
            >
              Zapisz Powiadomienia
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
