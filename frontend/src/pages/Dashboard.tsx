import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Save, Image as ImageIcon, Video, Gamepad2, Key, Check } from 'lucide-react';

const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Just Chatting');
  const [bannerUrl, setBannerUrl] = useState('');
  
  // 🟢 Rozdzielamy klucz od statusu ładowania
  const [streamKey, setStreamKey] = useState(''); 
  const [keyStatus, setKeyStatus] = useState('Ładowanie klucza z bazy...');
  
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false); // Stan do animacji przycisku kopiowania

  useEffect(() => {
    if (!user) return;
    
    const fetchMyData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/channels/private/${user.username}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || '');
          setCategory(data.current_category || 'Just Chatting');
          setBannerUrl(data.offline_banner || '');
          setStreamKey(data.stream_key); // Zapisujemy prawdziwy klucz
          setKeyStatus(''); // Czyścimy status błędu/ładowania
        } else {
          setKeyStatus('Błąd: Nie znaleziono kanału dla tego konta.');
        }
      } catch (error) {
        setKeyStatus('Błąd połączenia z serwerem API.');
      }
    };
    
    fetchMyData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Zapisywanie...');
    
    try {
      const res = await fetch('http://localhost:4000/api/channels/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.username,
          title,
          current_category: category,
          offline_banner: bannerUrl
        })
      });
      
      if (res.ok) setStatus('Zapisano pomyślnie!');
      else setStatus('Błąd zapisu.');
      
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus('Błąd połączenia z serwerem.');
    }
  };

  const handleCopy = () => {
    if (streamKey) {
      navigator.clipboard.writeText(streamKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Resetujemy przycisk po 2 sekundach
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#0f0f13]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Panel Twórcy</h1>
        
        <div className="bg-[#18181b] rounded-xl border border-gray-800 shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
            <Video className="w-5 h-5" /> Ustawienia Transmisji
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tytuł Streamu</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#27272a] text-white px-4 py-3 rounded-lg border border-transparent focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2 block">
                <Gamepad2 className="w-4 h-4" /> Kategoria
              </label>
              <select 
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#27272a] text-white px-4 py-3 rounded-lg border border-transparent focus:border-blue-500 outline-none transition-colors appearance-none"
              >
                <option value="Just Chatting">Just Chatting</option>
                <option value="Counter-Strike 2">Counter-Strike 2</option>
                <option value="Programowanie">Programowanie</option>
                <option value="Minecraft">Minecraft</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2 block">
                <ImageIcon className="w-4 h-4" /> Grafika Offline (Link URL)
              </label>
              <input 
                type="text" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://imgur.com/moj-baner.png"
                className="w-full bg-[#27272a] text-white px-4 py-3 rounded-lg border border-transparent focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
              <span className={`text-sm font-bold ${status.includes('Błąd') ? 'text-red-400' : 'text-green-400'}`}>
                {status}
              </span>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <Save className="w-4 h-4" /> Zapisz Zmiany
              </button>
            </div>
          </form>
        </div>

        <div className="bg-[#1f1f23] rounded-xl border border-gray-800 shadow-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-400" /> Klucz Strumienia (OBS)
          </h2>
          
          <div className="flex gap-4">
            <input 
              type={streamKey ? "password" : "text"} 
              readOnly 
              value={streamKey || keyStatus} 
              className={`flex-1 bg-black px-4 py-3 rounded-lg border border-gray-800 outline-none font-mono ${!streamKey ? 'text-red-400 italic' : 'text-gray-400'}`}
            />
            <button 
              onClick={handleCopy}
              disabled={!streamKey} // 🟢 Przycisk wyłączony, dopóki nie ma klucza
              className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#27272a] hover:bg-[#3f3f46] text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {copied ? <><Check className="w-4 h-4" /> Skopiowano</> : 'Kopiuj'}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Nigdy nie udostępniaj tego klucza! Wpisz w OBS: <br/>
            <span className="text-blue-400 font-mono mt-1 inline-block">Serwer: rtmp://localhost/live</span><br/>
            <span className="text-blue-400 font-mono">Klucz: {user?.username}?key=TWÓJ_KLUCZ</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;