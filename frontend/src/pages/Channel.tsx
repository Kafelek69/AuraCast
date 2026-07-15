import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import flvjs from 'flv.js';
import { useAuthStore } from '../store/authStore';
import { Lock } from 'lucide-react';

const socket: Socket = io('http://localhost:4000');

interface ChatMessage {
  username: string;
  message: string;
}

interface ChannelData {
  display_name: string;
  current_category: string;
  is_live: boolean;
  avatar_url: string;
}

const Channel: React.FC = () => {
  const { channelName } = useParams<{ channelName: string }>();
  const currentChannel = channelName || 'default-room';
  
  const user = useAuthStore((state) => state.user);

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const myUsername = user ? user.username : `Widz_${Math.floor(Math.random() * 1000)}`;

  // Pobieranie profilu kanału z bazy
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/channels/${currentChannel}`);
        if (res.ok) {
          const data = await res.json();
          setChannelData(data);
        }
      } catch (error) {
        console.error("Błąd pobierania danych kanału");
      }
    };
    fetchChannelData();
  }, [currentChannel]);

  // 🟢 LOGIKA ODTWARZACZA (Naprawiona wielkość liter i ładowanie)
  useEffect(() => {
    let flvPlayer: flvjs.Player | null = null;

    if (user && channelData?.is_live && flvjs.isSupported() && videoRef.current) {
      
      const timer = setTimeout(() => {
        flvPlayer = flvjs.createPlayer({
          type: 'flv',
          isLive: true,
          // 🟢 TUTAJ JEST MAGIA: Zawsze bierzemy dokładną nazwę z bazy (np. DevNinja zamiast devninja)
          url: `http://localhost:8000/live/${channelData.display_name}.flv`
        });

        flvPlayer.attachMediaElement(videoRef.current!);
        flvPlayer.load();
        
        const playPromise = flvPlayer.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.log("Autoplay zablokowany", error));
        }
      }, 300); // 300ms opóźnienia, żeby upewnić się, że tag <video> istnieje

      return () => {
        clearTimeout(timer);
        if (flvPlayer) flvPlayer.destroy();
      };
    }
  }, [currentChannel, user, channelData]); // Zależności zaktualizowane

  // Logika Czatu
  useEffect(() => {
    if (!user) return;
    
    setMessages([]);
    socket.emit('joinChannel', currentChannel);

    const handleNewMessage = (data: ChatMessage) => setMessages((prev) => [...prev, data]);
    socket.on('newMessage', handleNewMessage);

    return () => { socket.off('newMessage', handleNewMessage); };
  }, [currentChannel, user]); 

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;
    socket.emit('sendMessage', { channelId: currentChannel, username: myUsername, message: inputValue });
    setInputValue('');
  };

  return (
    <div className="flex w-full h-full bg-[#0f0f13]">
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="w-full aspect-video bg-black rounded-xl border border-gray-800 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group">
          
          {!user ? (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
              <Lock className="w-16 h-16 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Zawartość dla dorosłych / Zalogowanych</h2>
              <p className="text-gray-400 mb-6">Musisz posiadać konto w AuraCast, aby oglądać ten kanał.</p>
              <Link to="/auth" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                Zaloguj się
              </Link>
            </div>
          ) : (
            <>
              {!channelData && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">Ładowanie kanału...</div>
              )}

              {channelData?.is_live && (
                <>
                  <video ref={videoRef} className="w-full h-full object-contain" controls muted />
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10">NA ŻYWO</div>
                </>
              )}

              {channelData && !channelData.is_live && (
                <div className="absolute inset-0">
                  <img 
                    src={channelData.avatar_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'} 
                    alt="Stream Offline" 
                    className="w-full h-full object-cover opacity-60 grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <div className="w-16 h-16 bg-[#18181b] border-2 border-gray-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase text-gray-400 mb-4 shadow-lg shadow-black/50">
                      {channelData.display_name.charAt(0)}
                    </div>
                    <span className="text-white text-xl font-bold tracking-widest drop-shadow-lg uppercase">
                      {channelData.display_name} JEST TERAZ OFFLINE
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-6 flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-[#18181b] border-2 border-blue-500 rounded-full flex items-center justify-center text-xl font-bold uppercase text-blue-500 shadow-lg shadow-blue-500/20 overflow-hidden">
              {channelData?.avatar_url ? (
                <img src={channelData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentChannel.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{channelData?.display_name || currentChannel} - Transmisja na żywo</h1>
              <p className="text-blue-500 font-bold mt-1 cursor-pointer hover:underline">
                @{channelData?.display_name || currentChannel} • {channelData?.current_category || 'Brak kategorii'}
              </p>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
            Obserwuj
          </button>
        </div>
      </div>

      {/* CZAT */}
      <aside className="w-[340px] bg-[#18181b] border-l border-gray-800 flex flex-col shrink-0 shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1f1f23]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">Czat: {currentChannel}</h2>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {!user ? (
            <div className="text-center text-gray-500 text-sm mt-10">Zaloguj się, by zobaczyć czat.</div>
          ) : (
            <>
              {messages.length === 0 && <div className="text-center text-gray-500 text-sm mt-10 italic">Napisz coś jako pierwszy!</div>}
              {messages.map((msg, idx) => (
                <div key={idx} className="text-sm hover:bg-[#27272a] px-2 py-1 -mx-2 rounded transition-colors break-words">
                  <span className="font-bold text-blue-400 mr-2">{msg.username}:</span>
                  <span className="text-gray-200">{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>
        
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-[#1f1f23] relative">
          {!user && <div className="absolute inset-0 z-10 bg-[#1f1f23]/80 backdrop-blur-sm cursor-not-allowed"></div>}
          <input 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            disabled={!user}
            className="w-full bg-[#27272a] text-sm text-white px-4 py-3 rounded-lg outline-none focus:border-blue-500 border border-transparent transition-all placeholder-gray-500 disabled:opacity-50" 
            placeholder={user ? `Wyślij wiadomość...` : 'Tylko zalogowani'} 
          />
        </form>
      </aside>
    </div>
  );
};

export default Channel;