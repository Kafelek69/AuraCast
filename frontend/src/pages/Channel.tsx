import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import flvjs from 'flv.js';
import { useAuthStore } from '../store/authStore';
import { Lock, Heart, Share2, MoreVertical } from 'lucide-react';

const socket: Socket = io('http://localhost:4000');

interface ChatMessage { username: string; message: string; }
interface ChannelData { display_name: string; current_category: string; is_live: boolean; avatar_url: string; title?: string; }

// 🟢 Słownik emotek
const EMOTES: Record<string, string> = {
  'Kappa': 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/1.0',
  'LUL': 'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/1.0',
  'PogChamp': 'https://static-cdn.jtvnw.net/emoticons/v2/30259/default/dark/1.0',
  'RushB': 'https://static-cdn.jtvnw.net/emoticons/v2/301436573/default/dark/1.0', // Mały akcent taktyczny
  'Kreygasm': 'https://static-cdn.jtvnw.net/emoticons/v2/41/default/dark/1.0'
};

// 🟢 Generator kolorów dla nicków (zawsze ten sam kolor dla tego samego nicku)
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - color.length) + color;
};

// 🟢 Parser wiadomości podmieniający tekst na emotki
const renderMessage = (text: string) => {
  return text.split(' ').map((word, index) => {
    if (EMOTES[word]) {
      return <img key={index} src={EMOTES[word]} alt={word} className="inline-block h-6 mx-1 align-middle" />;
    }
    return <span key={index}>{word} </span>;
  });
};

const Channel: React.FC = () => {
  const { channelName } = useParams<{ channelName: string }>();
  const currentChannel = channelName || 'default';
  const user = useAuthStore((state) => state.user);

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const myUsername = user ? user.username : `Widz_${Math.floor(Math.random() * 1000)}`;

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/channels/${currentChannel}`);
        if (res.ok) setChannelData(await res.json());
      } catch (error) { console.error("Błąd"); }
    };
    fetchChannelData();
  }, [currentChannel]);

  useEffect(() => {
    let flvPlayer: flvjs.Player | null = null;
    if (user && channelData?.is_live && flvjs.isSupported() && videoRef.current) {
      const timer = setTimeout(() => {
        flvPlayer = flvjs.createPlayer({
          type: 'flv',
          isLive: true,
          url: `http://localhost:8000/live/${channelData.display_name}.flv`
        });
        flvPlayer.attachMediaElement(videoRef.current!);
        flvPlayer.load();
        flvPlayer.play().catch(e => console.log(e));
      }, 300);
      return () => { clearTimeout(timer); flvPlayer?.destroy(); };
    }
  }, [currentChannel, user, channelData?.is_live]);

  useEffect(() => {
    if (!user) return;
    setMessages([]);
    socket.emit('joinChannel', currentChannel);
    const handleNewMessage = (data: ChatMessage) => setMessages((prev) => [...prev, data]);
    socket.on('newMessage', handleNewMessage);
    return () => { socket.off('newMessage', handleNewMessage); };
  }, [currentChannel, user]); 

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'auto' }); }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;
    socket.emit('sendMessage', { channelId: currentChannel, username: myUsername, message: inputValue });
    setInputValue('');
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-[#0e0e10] text-[#efeff1] overflow-hidden">
      
      {/* 🟢 LEWA STRONA: Wideo + Informacje (Główna sekcja wzorowana na nowym Twitchu) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        
        {/* ODTWARZACZ */}
        <div className="w-full bg-black aspect-video relative flex-shrink-0 group">
          {!user ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#0e0e10]/95">
              <Lock className="w-12 h-12 text-[#bf94ff] mb-4" />
              <h2 className="text-xl font-bold mb-2">Zaloguj się, aby oglądać</h2>
              <Link to="/auth" className="bg-[#9146ff] hover:bg-[#a970ff] text-white px-6 py-2 rounded font-semibold transition-colors">
                Zaloguj się
              </Link>
            </div>
          ) : (
            <>
              {channelData?.is_live ? (
                <>
                  <video ref={videoRef} className="w-full h-full object-contain" controls autoPlay />
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-lg z-10">NA ŻYWO</div>
                </>
              ) : (
                <div className="absolute inset-0 bg-[#18181b] flex flex-col items-center justify-center border-b border-black">
                  <div className="w-20 h-20 bg-[#26262c] rounded-full flex items-center justify-center text-4xl font-bold uppercase text-gray-400 mb-4 shadow-lg shadow-black/50">
                    {currentChannel.charAt(0)}
                  </div>
                  <span className="text-white text-lg font-semibold">{channelData?.display_name || currentChannel} jest aktualnie offline.</span>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* INFO POD STREAMEM */}
        <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent hover:border-[#bf94ff] transition-colors cursor-pointer shrink-0 bg-[#26262c] flex items-center justify-center text-2xl font-bold">
              {channelData?.avatar_url ? (
                <img src={channelData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                 (channelData?.display_name || currentChannel).charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">{channelData?.title || 'Brak tytułu transmisji'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#bf94ff] font-semibold hover:underline cursor-pointer">{channelData?.display_name || currentChannel}</span>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-[#bf94ff] text-sm hover:underline cursor-pointer">{channelData?.current_category || 'Brak kategorii'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-[#9146ff] hover:bg-[#a970ff] text-white px-4 py-1.5 rounded font-semibold flex items-center gap-2 transition-colors text-sm">
              <Heart className="w-4 h-4" /> Obserwuj
            </button>
            <button className="bg-[#3a3a3d] hover:bg-[#464649] text-white px-3 py-1.5 rounded transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="bg-[#3a3a3d] hover:bg-[#464649] text-white px-3 py-1.5 rounded transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 PRAWA STRONA: CZAT */}
      <aside className="w-[340px] bg-[#18181b] border-l border-[#1f1f23] flex flex-col shrink-0">
        <div className="py-3 text-center border-b border-[#1f1f23] font-semibold text-xs uppercase tracking-widest text-[#efeff1] bg-[#18181b]">
          Czat Streamu
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1 custom-scrollbar">
          {!user ? (
            <div className="text-center text-gray-400 text-sm mt-10">Zaloguj się, aby rozmawiać.</div>
          ) : (
            <>
              <div className="text-center text-gray-500 text-xs mb-4">Witamy na czacie! Pamiętaj o kulturze.</div>
              {messages.map((msg, idx) => (
                <div key={idx} className="text-[14px] leading-5 hover:bg-[#202024] px-2 py-1 -mx-2 rounded">
                  <span className="font-bold mr-2 align-middle" style={{ color: stringToColor(msg.username) }}>
                    {msg.username}:
                  </span>
                  <span className="text-[#efeff1] align-middle">{renderMessage(msg.message)}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>
        
        <div className="p-4 bg-[#18181b]">
          <form onSubmit={sendMessage} className="relative">
            {!user && <div className="absolute inset-0 z-10 bg-[#18181b]/50 cursor-not-allowed"></div>}
            <div className="flex items-center bg-[#1f1f23] border border-[#303032] rounded focus-within:border-[#bf94ff] focus-within:ring-1 focus-within:ring-[#bf94ff] transition-all">
              <input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                disabled={!user}
                className="w-full bg-transparent text-[14px] text-white px-3 py-2.5 outline-none disabled:opacity-50" 
                placeholder="Wyślij wiadomość" 
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-400 font-semibold flex gap-2">
                <span>Kappa</span><span>LUL</span><span>RushB</span>
              </div>
              <button 
                type="submit" 
                disabled={!user || !inputValue.trim()}
                className="bg-[#9146ff] hover:bg-[#a970ff] disabled:bg-[#3a3a3d] disabled:text-gray-500 text-white px-3 py-1.5 rounded font-semibold text-xs transition-colors"
              >
                Czat
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Channel;