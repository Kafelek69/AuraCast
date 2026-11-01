import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import flvjs from 'flv.js';
import { useAuthStore } from '../store/authStore';
import { EMOTE_MAP, stringToChatColor } from '../utils/emotes';
import { EmotePicker } from '../components/EmotePicker';
import { ShareModal } from '../components/ShareModal';
import { API_URL, MEDIA_URL, WS_URL } from '../config/api';
import { useWhispersStore } from '../store/whispersStore';
import { 
  Heart, Share2, MoreVertical, Shield, Crown, 
  Smile, Send, Play, Pause, Volume2, VolumeX, Maximize, 
  CheckCircle2, Monitor, ArrowDown, ChevronRight, Settings, Coffee, MessageSquare
} from 'lucide-react';

let socket: Socket | null = null;

interface ChatMessage {
  id?: string;
  username: string;
  message: string;
  timestamp?: string | Date;
  role?: string;
}

interface ChannelData {
  display_name: string;
  title?: string;
  current_category: string;
  is_live: boolean;
  avatar_url?: string;
  offline_banner?: string;
  bio?: string;
}

export const Channel: React.FC = () => {
  const { channelName } = useParams<{ channelName: string }>();
  const currentChannel = channelName || 'devninja';
  const user = useAuthStore((state: any) => state.user);

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(1420);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmotePickerOpen, setIsEmotePickerOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'specs' | 'byom'>('about');
  
  // Stany odtwarzacza
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isTheater, setIsTheater] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const flvPlayerRef = useRef<flvjs.Player | null>(null);

  const myUsername = user ? user.username : `Widz_${Math.floor(Math.random() * 1000)}`;

  // Pobieranie danych kanału przez API_URL
  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await fetch(`${API_URL}/api/channels/${currentChannel}`);
        if (res.ok) {
          const data = await res.json();
          setChannelData(data);
        } else {
          setChannelData({
            display_name: currentChannel,
            title: `Transmisja u ${currentChannel}`,
            current_category: 'Just Chatting',
            is_live: false,
            bio: `Witaj na oficjalnym kanale ${currentChannel}! Bądź z nami na żywo.`
          });
        }
      } catch (err) {
        setChannelData({
          display_name: currentChannel,
          title: `Transmisja u ${currentChannel}`,
          current_category: 'Just Chatting',
          is_live: false,
          bio: `Witaj na oficjalnym kanale ${currentChannel}!`
        });
      }
    };
    fetchChannel();
  }, [currentChannel]);

  // Obsługa odtwarzacza FLV przez MEDIA_URL
  useEffect(() => {
    if (channelData?.is_live && flvjs.isSupported() && videoRef.current) {
      try {
        const player = flvjs.createPlayer({
          type: 'flv',
          isLive: true,
          url: `${MEDIA_URL}/live/${channelData.display_name}.flv`
        });
        flvPlayerRef.current = player;
        player.attachMediaElement(videoRef.current);
        player.load();
        const playPromise = player.play();
        if (playPromise && typeof (playPromise as Promise<void>).catch === 'function') {
          (playPromise as Promise<void>).catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
        }
      } catch (e) {
        console.error('FLV initialization notice:', e);
      }

      return () => {
        if (flvPlayerRef.current) {
          try {
            flvPlayerRef.current.destroy();
          } catch (err) {}
          flvPlayerRef.current = null;
        }
      };
    }
  }, [channelData?.is_live, channelData?.display_name]);

  // Obsługa WebSockets przez WS_URL
  useEffect(() => {
    if (!socket) {
      socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5
      });
    }

    setMessages([
      { username: 'System', message: `Witamy na czacie kanału ${currentChannel}! Pamiętaj o zachowaniu kultury.`, role: 'system' },
      { username: 'DevNinja', message: 'Witajcie wszyscy! PogChamp Cieszę się, że jesteście z nami!', role: 'streamer' },
      { username: 'AuraBot', message: 'Przypomnienie: Model BYOM pozwala wspierać twórcę bezpośrednio, bez żadnych subów i prowizji!', role: 'mod' }
    ]);

    socket.emit('joinChannel', currentChannel);

    const onNewMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('newMessage', onNewMessage);

    return () => {
      socket?.off('newMessage', onNewMessage);
    };
  }, [currentChannel]);

  // Auto-scroll czatu
  useEffect(() => {
    if (!isScrolledUp) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledUp]);

  const handleChatScroll = () => {
    if (chatScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
      const isUp = scrollHeight - scrollTop - clientHeight > 80;
      setIsScrolledUp(isUp);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsScrolledUp(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !socket) return;

    socket.emit('sendMessage', {
      channelId: currentChannel,
      username: myUsername,
      message: inputValue.trim(),
      role: user.username.toLowerCase() === currentChannel.toLowerCase() ? 'streamer' : 'user'
    });

    setInputValue('');
  };

  const handleSelectEmote = (code: string) => {
    setInputValue((prev) => (prev ? `${prev} ${code} ` : `${code} `));
  };

  const renderMessageContent = (text: string) => {
    const parts = text.split(' ');
    return parts.map((part, index) => {
      if (EMOTE_MAP[part]) {
        return (
          <img
            key={index}
            src={EMOTE_MAP[part]}
            alt={part}
            title={part}
            className="inline-block h-6 w-auto mx-0.5 align-middle hover:scale-125 transition-transform"
          />
        );
      }
      return <span key={index}>{part} </span>;
    });
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-56px)] bg-[var(--bg-base)] text-[#f1f5f9] overflow-hidden select-none">
      
      {/* 🟢 LEWA STRONA: ODTWARZACZ + INFORMACJE O KANALE + PANELE */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar transition-all ${isTheater ? 'lg:pr-0' : ''}`}>
        
        {/* ODTWARZACZ WIDEO */}
        <div className="w-full bg-black aspect-video relative flex-shrink-0 group overflow-hidden">
          
          {channelData?.is_live ? (
            <div className="relative w-full h-full">
              <video 
                ref={videoRef} 
                className="w-full h-full object-contain" 
                autoPlay 
                playsInline
                onClick={togglePlay}
              />

              {/* Kontrolki na hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
                
                <div className="flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-2">
                    <span className="badge-live animate-pulse">NA ŻYWO</span>
                    <span className="bg-black/80 backdrop-blur-md text-[11px] font-bold px-2 py-0.5 rounded text-white border border-white/10">
                      1080p60
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-black/80 backdrop-blur-md text-xs font-bold px-2 py-1 rounded text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                      <span>8,432 widzów</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors">
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current text-[var(--brand-primary)]" />}
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      <button onClick={toggleMute} className="p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors">
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[var(--brand-primary)]" />}
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 sm:w-24 accent-[var(--brand-primary)] cursor-pointer h-1 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsTheater(!isTheater)} 
                      title={isTheater ? "Normalny widok" : "Tryb kinowy"}
                      className="p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors"
                    >
                      <Monitor className="w-4 h-4 text-gray-300 hover:text-white" />
                    </button>
                    <button 
                      onClick={() => {
                        if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen();
                      }}
                      title="Pełny ekran"
                      className="p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors"
                    >
                      <Maximize className="w-4 h-4 text-gray-300 hover:text-white" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* EKRAN OFFLINE */
            <div className="relative w-full h-full bg-[#0a0d12] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d12] via-transparent to-[#0a0d12]"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-[#141b24] border-4 border-blue-600/40 flex items-center justify-center text-3xl font-black text-blue-400 uppercase shadow-2xl">
                    {currentChannel.charAt(0)}
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-gray-500 border-2 border-[#0a0d12]"></span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
                  {channelData?.display_name || currentChannel} jest aktualnie <span className="text-gray-400">offline</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-6">
                  Zaobserwuj kanał, aby otrzymać powiadomienie, gdy twórca uruchomi stream na żywo!
                </p>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleFollowToggle}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                      isFollowing 
                        ? 'bg-[#1b2330] text-gray-200 border border-gray-600' 
                        : 'bg-[var(--brand-primary)] hover:bg-blue-500 text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{isFollowing ? 'Obserwujesz' : 'Obserwuj'}</span>
                  </button>

                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2.5 rounded-xl bg-[#151c26] hover:bg-[#1e2736] text-gray-300 hover:text-white transition-colors border border-[var(--border-subtle)]"
                    title="Udostępnij kanał"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 🟢 PASEK INFORMACJI O KANALE */}
        <div className="p-4 sm:p-6 bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Awatar + Nazwa + Tytuł */}
            <div className="flex items-start gap-4 min-w-0">
              <div className="relative shrink-0 group/av">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] p-0.5 bg-[var(--bg-base)] shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  {channelData?.avatar_url ? (
                    <img src={channelData.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#16202c] flex items-center justify-center text-xl font-bold uppercase text-[var(--brand-primary)]">
                      {(channelData?.display_name || currentChannel).charAt(0)}
                    </div>
                  )}
                </div>
                {channelData?.is_live && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-[9px] font-black uppercase text-white px-1.5 py-0.2 rounded shadow-md">
                    LIVE
                  </span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white hover:text-[var(--brand-primary)] cursor-pointer transition-colors truncate">
                    {channelData?.display_name || currentChannel}
                  </h2>
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] fill-current shrink-0" />
                  <span className="text-[10px] font-bold text-gray-400 bg-[#161c24] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    {followersCount.toLocaleString()} obserwujących
                  </span>
                </div>

                <h1 className="text-sm sm:text-base font-bold text-gray-200 mt-1 line-clamp-1">
                  {channelData?.title || 'Transmisja na żywo | AuraCast'}
                </h1>

                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <Link 
                    to={`/?category=${encodeURIComponent(channelData?.current_category || 'Just Chatting')}`}
                    className="text-[var(--brand-primary)] font-bold hover:underline"
                  >
                    {channelData?.current_category || 'Just Chatting'}
                  </Link>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 font-semibold">Polski</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-[10px] bg-blue-950/60 text-blue-400 px-1.5 py-0.2 rounded border border-blue-800/40 font-bold">
                    100% BYOM (Zero haraczu)
                  </span>
                </div>
              </div>
            </div>

            {/* Przyciski Akcji: Obserwuj / Wesprzyj (BYOM) / Udostępnij */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-end shrink-0">
              
              {/* Obserwuj */}
              <button
                onClick={handleFollowToggle}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  isFollowing
                    ? 'bg-[#1e2633] text-gray-200 border border-gray-600'
                    : 'bg-[var(--brand-primary)] hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFollowing ? 'Obserwujesz' : 'Obserwuj'}</span>
              </button>

              {/* Wspomóż Twórcę (BYOM Donate) */}
              <button
                onClick={() => setActiveTab('byom')}
                className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-[#17202d] hover:bg-[#202c3d] text-blue-300 border border-blue-500/40 transition-all shadow-md group"
              >
                <Coffee className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Wspomóż (BYOM)</span>
              </button>

              {/* Udostępnij */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 rounded-xl bg-[#141a22] hover:bg-[#1e2733] text-gray-300 hover:text-white transition-colors border border-[var(--border-subtle)]"
                title="Udostępnij transmisję"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Wiadomość prywatna (Whisper) */}
              <button
                onClick={() => useWhispersStore.getState().startConversation(currentChannel)}
                className="p-2 rounded-xl bg-[#141a22] hover:bg-[#1e2733] text-gray-300 hover:text-white transition-colors border border-[var(--border-subtle)]"
                title="Wyślij wiadomość prywatną (Szept)"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Opcje */}
              <button
                className="p-2 rounded-xl bg-[#141a22] hover:bg-[#1e2733] text-gray-300 hover:text-white transition-colors border border-[var(--border-subtle)]"
                title="Więcej opcji"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* 🟢 ZAKŁADKI KANAŁU */}
        <div className="p-4 sm:p-6 space-y-6">
          
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'about' 
                  ? 'bg-[var(--brand-primary)] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              O kanale
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'specs' 
                  ? 'bg-[var(--brand-primary)] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sprzęt & PC
            </button>
            <button
              onClick={() => setActiveTab('byom')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'byom' 
                  ? 'bg-[var(--brand-primary)] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Wsparcie Twórcy (BYOM)</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono">100% DLA TWÓRCY</span>
            </button>
          </div>

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-md">
                <h3 className="font-extrabold text-sm text-white mb-2 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span>O Streamerze</span>
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {channelData?.bio || `Witaj na kanale ${currentChannel}! Transmituję codzienne rozgrywki, turnieje oraz pogawędki z widzami. Wpadaj na czat i bądź częścią naszej społeczności!`}
                </p>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-md">
                <h3 className="font-extrabold text-sm text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Zasady Czatowe</span>
                </h3>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                  <li>Szanuj innych użytkowników na czacie</li>
                  <li>Brak spamu i niepotrzebnego caps-locka</li>
                  <li>Baw się dobrze i korzystaj z emotek!</li>
                </ul>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-md">
                <h3 className="font-extrabold text-sm text-white mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Społeczność & Sociale</span>
                </h3>
                <div className="space-y-2 mt-3">
                  <a href="https://discord.com" target="_blank" rel="noreferrer" className="block text-xs font-semibold p-2 rounded-lg bg-[#151c26] text-blue-400 hover:bg-[#1d2735] transition-colors">
                    💬 Oficjalny Discord
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" className="block text-xs font-semibold p-2 rounded-lg bg-[#151c26] text-red-400 hover:bg-[#1d2735] transition-colors">
                    🎥 Kanał YouTube
                  </a>
                  <a href="https://x.com" target="_blank" rel="noreferrer" className="block text-xs font-semibold p-2 rounded-lg bg-[#151c26] text-gray-300 hover:bg-[#1d2735] transition-colors">
                    🐦 Twitter / X
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-md max-w-xl">
              <h3 className="font-extrabold text-sm text-white mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Stanowisko i Sprzęt PC</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0e1319] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Karta Graficzna</span>
                  <span className="font-bold text-gray-200">RTX 4080 Super 16GB</span>
                </div>
                <div className="bg-[#0e1319] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Procesor</span>
                  <span className="font-bold text-gray-200">AMD Ryzen 7 7800X3D</span>
                </div>
                <div className="bg-[#0e1319] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Pamięć RAM</span>
                  <span className="font-bold text-gray-200">32GB DDR5 6000MHz</span>
                </div>
                <div className="bg-[#0e1319] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Mikrofon</span>
                  <span className="font-bold text-gray-200">Shure SM7B + GoXLR</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'byom' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-md max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Model BYOM (Bez Prowizji Platformy)</h3>
                  <p className="text-xs text-gray-400">Wszystkie wpłaty trafiają bezpośrednio na konto twórcy.</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-5">
                Na AuraCast nie ma wymuszonych subów ani 50% haraczu. Każda złotówka przekazana przez poniższe linki trafia w 100% bezpośrednio do streamera.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://ko-fi.com" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-[#161e29] border border-blue-500/30 text-xs font-bold text-blue-400 hover:bg-[#1f2b3b] transition-colors">
                  ☕ Postaw kawę na Ko-fi
                </a>
                <a href="https://patreon.com" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-[#161e29] border border-red-500/30 text-xs font-bold text-red-400 hover:bg-[#1f2b3b] transition-colors">
                  ❤️ Wesprzyj na Patreonie
                </a>
                <a href="https://tiply.pl" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-[#161e29] border border-yellow-500/30 text-xs font-bold text-yellow-400 hover:bg-[#1f2b3b] transition-colors">
                  ⚡ Wyślij Donate z wiadomością (Tiply)
                </a>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 🟢 PRAWA STRONA: INTERAKTYWNY CZAT */}
      <aside 
        className={`bg-[var(--bg-card)] border-l border-[var(--border-subtle)] flex flex-col shrink-0 transition-all duration-200 relative ${
          isChatCollapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-[350px] xl:w-[380px] h-[400px] lg:h-full'
        }`}
      >
        <div className="h-12 px-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-card)]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs uppercase tracking-wider text-gray-200">
              Czat Streamu
            </span>
            <span className="text-[10px] text-gray-400 font-bold bg-[#141b24] px-1.5 py-0.2 rounded border border-[var(--border-subtle)]">
              8.4k
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors" title="Ustawienia czatu">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsChatCollapsed(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors hidden lg:block" 
              title="Zwiń czat"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Przypięte ogłoszenie */}
        <div className="px-3 py-1.5 bg-[#0e131a] border-b border-[var(--border-subtle)] flex items-center gap-2 text-[11px] text-gray-300 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] shrink-0"></span>
          <span className="truncate">Wpisz <b>!info</b> aby sprawdzić zasady kanału!</span>
        </div>

        {/* Wiadomości czatu */}
        <div 
          ref={chatScrollRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar text-xs"
        >
          {messages.map((msg, idx) => {
            const isStreamer = msg.role === 'streamer' || msg.username.toLowerCase() === currentChannel.toLowerCase();
            const isMod = msg.role === 'mod';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div key={idx} className="text-[11px] text-gray-400 text-center py-1 bg-[#0c1015] rounded-lg my-1 px-2 italic border border-[var(--border-subtle)]">
                  {msg.message}
                </div>
              );
            }

            return (
              <div 
                key={idx} 
                className="leading-5 hover:bg-[#161d27] px-2 py-1 -mx-1 rounded-lg transition-colors group flex items-start flex-wrap break-words"
              >
                <span className="inline-flex items-center gap-1 mr-1.5 select-none shrink-0">
                  {isStreamer && (
                    <span title="Streamer" className="bg-red-600 text-white rounded p-0.5 text-[9px] font-black inline-flex items-center">
                      <Crown className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {isMod && (
                    <span title="Moderator" className="bg-green-600 text-white rounded p-0.5 text-[9px] font-black inline-flex items-center">
                      <Shield className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <span title="Zweryfikowany" className="bg-blue-600 text-white rounded p-0.5 text-[9px] font-black inline-flex items-center">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </span>
                </span>

                <span 
                  className="font-bold mr-1.5 cursor-pointer hover:underline"
                  style={{ color: stringToChatColor(msg.username) }}
                >
                  {msg.username}:
                </span>

                <span className="text-[#f1f5f9] break-all">
                  {renderMessageContent(msg.message)}
                </span>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {isScrolledUp && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[var(--brand-primary)] text-white px-3 py-1 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 z-30 hover:scale-105 transition-transform"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Nowe wiadomości</span>
          </button>
        )}

        {/* Pasek szybkich emotek */}
        <div className="px-3 py-1.5 bg-[#0e131a] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] shrink-0">
          <div className="flex items-center gap-1.5">
            {['Kappa', 'LUL', 'PogChamp', 'RushB', 'KEKW'].map((emote) => (
              <button
                key={emote}
                onClick={() => handleSelectEmote(emote)}
                className="hover:scale-125 transition-transform"
                title={emote}
              >
                <img src={EMOTE_MAP[emote]} alt={emote} className="h-5 w-auto" />
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsEmotePickerOpen(!isEmotePickerOpen)}
            className="p-1 rounded hover:bg-[#1a232f] text-gray-300 hover:text-[var(--brand-primary)] transition-colors"
            title="Wszystkie emotki"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        {/* Formularz wprowadzania wiadomości */}
        <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] shrink-0 relative">
          
          <EmotePicker 
            isOpen={isEmotePickerOpen} 
            onClose={() => setIsEmotePickerOpen(false)} 
            onSelect={(code) => {
              handleSelectEmote(code);
              setIsEmotePickerOpen(false);
            }} 
          />

          {!user ? (
            <div className="bg-[#0e131a] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-300 mb-2">
                Zaloguj się, aby rozmawiać na czacie
              </p>
              <Link 
                to="/auth"
                className="inline-block bg-[var(--brand-primary)] hover:bg-blue-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Zaloguj się
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="relative flex items-center bg-[#0d1218] border border-[var(--border-subtle)] rounded-xl focus-within:border-[var(--brand-primary)] transition-colors">
                <input 
                  type="text"
                  placeholder="Napisz na czacie..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-transparent text-xs text-white px-3 py-2.5 outline-none placeholder-gray-500"
                />
                
                <button
                  type="button"
                  onClick={() => setIsEmotePickerOpen(!isEmotePickerOpen)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Wybierz emotkę"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-semibold">
                  Naciśnij Enter, aby wysłać
                </span>

                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-[var(--brand-primary)] hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>Czat</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}

        </div>

      </aside>

      <ShareModal 
        channelName={channelData?.display_name || currentChannel} 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />

    </div>
  );
};

export default Channel;