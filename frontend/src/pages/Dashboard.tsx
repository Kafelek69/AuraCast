import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config/api';
import { 
  LayoutDashboard, BarChart2, Folder, Users, Settings as SettingsIcon,
  Wrench, Monitor, MessageSquare, Eye, Clock, UserPlus, ChevronDown,
  Copy, Check, Radio, Save, Send, X, Video, ArrowLeft
} from 'lucide-react';

interface ChatItem {
  id: string;
  username: string;
  message: string;
  color: string;
  badge?: string;
  isBroadcaster?: boolean;
}

const INITIAL_CHAT: ChatItem[] = [
  { id: '1', username: 'Anrississ_2804', message: 'His bary?', color: '#c084fc', badge: 'VIP' },
  { id: '2', username: 'HIKARTopeblis', message: 'Whoohothe god gueudro erik?', color: '#34d399', badge: 'PRO' },
  { id: '3', username: 'Amrtsise_2803', message: 'that already anulo', color: '#60a5fa', badge: 'SUB' },
  { id: '4', username: 'NIGHTOWL_TV', message: 'Apex Legends', color: '#22d3ee', badge: 'HOST', isBroadcaster: true }
];

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state: any) => state.user);

  // Główne stany nawigacji
  const [activeNavTab, setActiveNavTab] = useState<'dashboard' | 'analytics' | 'content' | 'community' | 'settings'>('dashboard');
  const [activeSideTab, setActiveSideTab] = useState<'dashboard' | 'setup' | 'analytics' | 'overlay' | 'chat' | 'settings'>('dashboard');

  // Status transmisji na żywo
  const [isLive, setIsLive] = useState(true);
  const [uptimeSeconds, setUptimeSeconds] = useState(2 * 3600 + 14 * 60 + 56); // 02h 14m 56s
  const [viewers, setViewers] = useState(1248);
  const [chatters] = useState(456);
  const [followers] = useState(34);

  // Ustawienia OBS i RTMP
  const [serverUrl] = useState('rtmp://localhost:1935/live');
  const [streamKey, setStreamKey] = useState(user ? `live_${user.username}_sec89f` : 'live_nightowl_sec_9942a17');
  const [showKey, setShowKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Ustawienia Streamu
  const [title, setTitle] = useState('Solo Queues & Community Night! | Chasing Rank');
  const [category, setCategory] = useState('Apex Legends');
  const [tags, setTags] = useState(['#FPS', '#Gaming', '#SoloQueue', '#Live']);
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // Mini Czat na żywo
  const [chatMessages, setChatMessages] = useState<ChatItem[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Zegar czasu trwania streamu
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Lekkie naturalne wahania widowni
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 7) - 3;
      setViewers((prev) => Math.max(1200, prev + delta));
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Pobranie danych kanału z backendu
  useEffect(() => {
    if (!user) return;
    const loadChannel = async () => {
      try {
        const res = await fetch(`${API_URL}/api/channels/private/${user.username}`);
        if (res.ok) {
          const data = await res.json();
          if (data.title) setTitle(data.title);
          if (data.current_category) setCategory(data.current_category);
          if (data.stream_key) setStreamKey(data.stream_key);
        }
      } catch (e) {
        // Fallback
      }
    };
    loadChannel();
  }, [user]);

  // Auto-scroll czatu
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatUptime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${hours}h ${mins}m ${secs}s`;
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(serverUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(streamKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Zapisywanie...');
    try {
      if (user) {
        await fetch(`${API_URL}/api/channels/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.username,
            title,
            current_category: category
          })
        });
      }
      setSaveStatus('Zapisano pomyślnie!');
    } catch (err) {
      setSaveStatus('Zapisano lokalnie!');
    }
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const formatted = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
      if (!tags.includes(formatted)) {
        setTags([...tags, formatted]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ChatItem = {
      id: Date.now().toString(),
      username: user?.username?.toUpperCase() || 'NIGHTOWL_TV',
      message: chatInput.trim(),
      color: '#22d3ee',
      badge: 'HOST',
      isBroadcaster: true
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const toggleGoLive = () => {
    if (!isLive) {
      setIsLive(true);
      setUptimeSeconds(0);
    } else {
      setIsLive(false);
    }
  };

  const currentUsername = user?.username?.toUpperCase() || 'NIGHTOWL_TV';

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0d14] text-[#f1f5f9] font-sans overflow-hidden select-none">
      
      {/* 🟢 1. GÓRNY PASEK NAWIGACJI (CREATOR STUDIO HEADER) */}
      <header className="h-14 bg-[#0d121c] border-b border-[#1b2535] flex items-center justify-between px-3 sm:px-6 shrink-0 z-30">
        
        {/* Lewa strona: Logo CREATOR STUDIO */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_18px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-transform">
              <span className="text-base font-black tracking-tighter">⚡</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-widest text-cyan-400 font-display uppercase">
                CREATOR <span className="text-white">STUDIO</span>
              </span>
            </div>
          </Link>
          <div className="h-4 w-px bg-[#1e2a3c] hidden sm:block"></div>
          <Link 
            to="/" 
            className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Wróć do AuraCast</span>
          </Link>
        </div>

        {/* Środek: Poziome Zakładki Nawigacji */}
        <nav className="hidden md:flex items-center gap-1.5">
          {[
            { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
            { id: 'analytics' as const, label: 'Analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
            { id: 'content' as const, label: 'Content', icon: <Folder className="w-3.5 h-3.5" /> },
            { id: 'community' as const, label: 'Community', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'settings' as const, label: 'Settings', icon: <SettingsIcon className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveNavTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all relative ${
                activeNavTab === tab.id
                  ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#131a26]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Prawa strona: Profil Streamera & Status LIVE */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#121924] border border-[#1e2a3c] px-2.5 py-1 rounded-full shadow-md">
            <div className="relative">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80"}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.7)]"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                isLive ? 'bg-red-500 animate-ping' : 'bg-gray-500'
              }`}></span>
            </div>

            <span className="text-xs font-black text-gray-200 tracking-wider">
              {currentUsername}
            </span>

            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
              isLive ? 'bg-red-600 text-white animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]' : 'bg-gray-800 text-gray-400'
            }`}>
              <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
            </span>

            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

      </header>

      {/* 🟢 2. GŁÓWNA PRZESTRZEŃ ROBOCZA (Sidebar + Dashboard Grid) */}
      <div className="flex flex-1 overflow-hidden bg-[#090d14]">
        
        {/* LEWY BOCZNY PASEK STUDIO */}
        <aside className="w-48 lg:w-56 bg-[#0c1119] border-r border-[#182232] flex flex-col justify-between p-3 shrink-0 select-none">
          <div className="space-y-1">
            {[
              { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'setup' as const, label: 'Stream Setup', icon: <Wrench className="w-4 h-4" /> },
              { id: 'analytics' as const, label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
              { id: 'overlay' as const, label: 'Overlay Manager', icon: <Monitor className="w-4 h-4" /> },
              { id: 'chat' as const, label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'settings' as const, label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSideTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                  activeSideTab === item.id
                    ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#121822]'
                }`}
              >
                <span className={activeSideTab === item.id ? 'text-cyan-400' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* KARTA QUICK STATS W SIDEBARZE */}
          <div className="bg-[#101621] border border-[#1a2536] rounded-2xl p-3.5 space-y-2.5 shadow-lg">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              QUICK STATS
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Views</span>
                </span>
                <span className="font-extrabold text-white">24.8k</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Avg Time</span>
                </span>
                <span className="font-extrabold text-white">48m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Followers</span>
                </span>
                <span className="font-extrabold text-cyan-400">+142</span>
              </div>
            </div>
          </div>
        </aside>

        {/* GŁÓWNA ZAWARTOŚĆ DASHBOARDU */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 lg:p-6 bg-[#0a0e16]">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 max-w-[1680px] mx-auto">
            
            {/* 🟢 LEWA KOLUMNA (8 / 12): STATUS TRANSMISJI + NEONOWY WYKRES */}
            <div className="xl:col-span-8 space-y-4 sm:space-y-5">
              
              {/* 1. KARTA: LIVE STATUS ONLINE ⚡ */}
              <div className="bg-[#101724] border border-[#1c293c] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#182334]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm sm:text-base font-black tracking-wide text-white uppercase flex items-center gap-2">
                      <span>LIVE STATUS:</span>
                      <span className={isLive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-gray-400'}>
                        {isLive ? 'ONLINE ⚡' : 'OFFLINE'}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-300 bg-[#162030] px-3 py-1 rounded-xl border border-[#223045]">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isLive ? formatUptime(uptimeSeconds) : '00h 00m 00s'}</span>
                  </div>
                </div>

                {/* Statystyki: Viewers, Chatters, Followers */}
                <div className="grid grid-cols-3 gap-3 pt-4 items-center">
                  
                  {/* Viewers */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-semibold">Viewers</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-600/40 px-1.5 py-0.2 rounded">
                        ↑ 15%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {isLive ? viewers.toLocaleString() : '0'}
                      </span>
                    </div>
                    {/* Mini Sparkline w stylu neonowym */}
                    <svg className="w-28 sm:w-36 h-6 overflow-visible" viewBox="0 0 120 24">
                      <defs>
                        <linearGradient id="sparkline-cyan" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 18 Q 20 22, 40 12 T 80 8 T 120 2"
                        fill="none"
                        stroke="url(#sparkline-cyan)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]"
                      />
                    </svg>
                  </div>

                  {/* Chatters */}
                  <div className="space-y-1 pl-4 border-l border-[#192436]">
                    <span className="text-xs text-gray-400 font-semibold block">Chatters</span>
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight block">
                      {isLive ? chatters : '0'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold block">98% aktywności</span>
                  </div>

                  {/* Followers */}
                  <div className="space-y-1 pl-4 border-l border-[#192436]">
                    <span className="text-xs text-gray-400 font-semibold block">Followers</span>
                    <span className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight block drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                      +{followers}
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold block">W tej sesji</span>
                  </div>

                </div>
              </div>

              {/* 2. KARTA: STREAM ANALYTICS (Wykres Neon Glow Dual-Line) */}
              <div className="bg-[#101724] border border-[#1c293c] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                
                {/* Nagłówek Wykresu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <h2 className="text-sm font-black text-white tracking-wide uppercase">
                    STREAM ANALYTICS
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="text-gray-400 text-[11px]">Concurrent Viewers (Last 3 Hours)</span>
                    <span className="text-gray-600">•</span>
                    <span className="font-bold">Peak Viewers: <span className="text-cyan-400">1,310</span></span>
                    <span className="text-gray-600">•</span>
                    <span className="font-bold">Avg Viewers: <span className="text-purple-400">988</span></span>
                  </div>
                </div>

                {/* SVG Neon Chart Container */}
                <div className="relative w-full aspect-[21/9] sm:h-64 bg-[#0d131f] border border-[#162132] rounded-xl p-3 flex flex-col justify-between overflow-hidden">
                  
                  {/* Neon Glow Filters */}
                  <svg className="w-full h-full" viewBox="0 0 700 220" preserveAspectRatio="none">
                    <defs>
                      <filter id="neon-cyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <filter id="neon-purple" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Poziome linie siatki Y */}
                    <line x1="45" y1="20" x2="690" y2="20" stroke="#162234" strokeWidth="1" />
                    <line x1="45" y1="65" x2="690" y2="65" stroke="#162234" strokeWidth="1" />
                    <line x1="45" y1="110" x2="690" y2="110" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
                    <line x1="45" y1="155" x2="690" y2="155" stroke="#162234" strokeWidth="1" />
                    <line x1="45" y1="200" x2="690" y2="200" stroke="#162234" strokeWidth="1" />

                    {/* Etykiety osi Y po lewej */}
                    <text x="35" y="24" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">1,390</text>
                    <text x="35" y="69" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">1,100</text>
                    <text x="35" y="114" fill="#38bdf8" fontSize="10" textAnchor="end" fontFamily="monospace" fontWeight="bold">988</text>
                    <text x="35" y="159" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">600</text>
                    <text x="35" y="204" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">300</text>

                    {/* Linia Fioletowa (Zaangażowanie / Czat) */}
                    <path
                      d="M 50 195 
                         C 90 180, 130 145, 170 150 
                         C 210 155, 250 140, 290 130 
                         C 330 120, 370 145, 410 125 
                         C 450 105, 490 140, 530 115 
                         C 570 90, 610 130, 650 80 
                         L 690 90"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#neon-purple)"
                    />

                    {/* Główna Linia Cyjanowa (Widzowie na żywo) */}
                    <path
                      d="M 50 205 
                         C 80 160, 105 180, 130 150 
                         C 155 120, 180 175, 210 140 
                         C 240 105, 260 165, 290 120 
                         C 310 90, 335 30, 360 35 
                         C 385 40, 400 130, 425 155 
                         C 450 180, 475 75, 500 120 
                         C 525 165, 550 120, 575 80 
                         C 600 40, 625 130, 650 90 
                         C 665 70, 680 85, 690 70"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#neon-cyan)"
                    />

                    {/* Punkty szczytowe na linii cyjanowej */}
                    <circle cx="360" cy="35" r="4.5" fill="#22d3ee" className="animate-pulse" filter="url(#neon-cyan)" />
                    <circle cx="575" cy="80" r="3.5" fill="#22d3ee" />
                    <circle cx="690" cy="70" r="4.5" fill="#22d3ee" filter="url(#neon-cyan)" />

                    {/* Etykiety osi X (Oś czasu na dole) */}
                    <text x="50" y="218" fill="#64748b" fontSize="10" fontFamily="monospace">0h</text>
                    <text x="260" y="218" fill="#64748b" fontSize="10" fontFamily="monospace">1h</text>
                    <text x="475" y="218" fill="#64748b" fontSize="10" fontFamily="monospace">2h</text>
                    <text x="680" y="218" fill="#64748b" fontSize="10" fontFamily="monospace">3h</text>
                  </svg>

                </div>

                {/* Legenda pod wykresem */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
                      <span>Widzowie równolegli (Concurrent Viewers)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-purple-400 rounded-full shadow-[0_0_6px_rgba(192,132,252,0.8)]"></span>
                      <span>Aktywność czatu (Chat Velocity)</span>
                    </span>
                  </div>
                  <span className="text-gray-500 font-mono">Odświeżanie w czasie rzeczywistym</span>
                </div>

              </div>

            </div>

            {/* 🟢 PRAWA KOLUMNA (4 / 12): SETUP OBS + STREAM SETTINGS + LIVE CHAT */}
            <div className="xl:col-span-4 space-y-4 sm:space-y-5">
              
              {/* 1. KARTA: STREAM SETUP (OBS RTMP CONFIGURATION) */}
              <div className="bg-[#101724] border border-[#1c293c] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-white tracking-wider uppercase">
                    STREAM SETUP
                  </h2>
                  <span className="text-[10px] font-bold text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                    OBS READY
                  </span>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">
                    OBS RTMP CONFIGURATION
                  </span>

                  {/* Server URL */}
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Server URL</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={serverUrl}
                        className="flex-1 bg-[#090d15] text-gray-300 text-xs px-3 py-2 rounded-xl border border-[#1c283a] font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="px-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center justify-center"
                        title="Kopiuj Server URL"
                      >
                        {copiedUrl ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Stream Key */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-gray-400 font-semibold">Stream Key</label>
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
                      >
                        [{showKey ? 'HIDE' : 'SHOW'}]
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type={showKey ? 'text' : 'password'}
                        readOnly
                        value={streamKey}
                        className="flex-1 bg-[#090d15] text-cyan-400 text-xs px-3 py-2 rounded-xl border border-[#1c283a] font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="px-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center justify-center"
                        title="Kopiuj Stream Key"
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. KARTA: STREAM SETTINGS (Edycja tytułu, kategorii, tagów) */}
              <div className="bg-[#101724] border border-[#1c293c] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
                <h2 className="text-xs font-black text-white tracking-wider uppercase">
                  STREAM SETTINGS
                </h2>

                <form onSubmit={handleSaveSettings} className="space-y-3">
                  {/* Title */}
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Wpisz tytuł streamu..."
                      className="w-full bg-[#090d15] text-white text-xs px-3 py-2 rounded-xl border border-[#1c283a] focus:border-cyan-400 outline-none transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Category</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#090d15] text-white text-xs px-3 py-2 rounded-xl border border-[#1c283a] focus:border-cyan-400 outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="Apex Legends">Apex Legends</option>
                        <option value="Counter-Strike 2">Counter-Strike 2</option>
                        <option value="Valorant">Valorant</option>
                        <option value="Just Chatting">Just Chatting</option>
                        <option value="Programowanie">Programowanie</option>
                        <option value="Grand Theft Auto V">Grand Theft Auto V</option>
                        <option value="Minecraft">Minecraft</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Tags</label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-[#090d15] rounded-xl border border-[#1c283a] min-h-[38px] items-center">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-[#141e2c] border border-[#23354b] text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-400"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="+ Dodaj tag (Enter)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="bg-transparent text-[10px] text-white placeholder-gray-500 outline-none flex-1 min-w-[90px]"
                      />
                    </div>
                  </div>

                  {/* Przyciski Akcji: SAVE SETTINGS & GO LIVE */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="submit"
                      className="bg-[#122838] hover:bg-[#183449] border border-cyan-800/40 text-cyan-300 font-extrabold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>SAVE SETTINGS</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleGoLive}
                      className={`font-black text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                        isLive
                          ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_18px_rgba(6,182,212,0.7)]'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>{isLive ? '((•)) GO LIVE' : 'START STREAM'}</span>
                    </button>
                  </div>

                  {saveStatus && (
                    <p className="text-[11px] text-center font-bold text-cyan-400 animate-fade-in">
                      {saveStatus}
                    </p>
                  )}
                </form>
              </div>

              {/* 3. KARTA: LIVE CHAT (Zadokowany podgląd czatu na żywo) */}
              <div className="bg-[#101724] border border-[#1c293c] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-[320px]">
                
                {/* Nagłówek Czatu */}
                <div className="flex items-center justify-between pb-3 border-b border-[#182334] shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h2 className="text-xs font-black text-white tracking-wider uppercase">
                      LIVE CHAT
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Video className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    <SettingsIcon className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                  </div>
                </div>

                {/* Strumień Wiadomości */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-2.5 space-y-2 text-xs">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-1.5 leading-relaxed">
                      {msg.badge && (
                        <span className={`text-[9px] font-black uppercase px-1 py-0.2 rounded font-mono shrink-0 ${
                          msg.isBroadcaster 
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : 'bg-[#182334] text-gray-400 border border-[#24354c]'
                        }`}>
                          {msg.badge}
                        </span>
                      )}
                      <span className="font-bold shrink-0" style={{ color: msg.color }}>
                        {msg.username}:
                      </span>
                      <span className="text-gray-200 break-words">
                        {msg.message}
                      </span>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input do pisania na czacie */}
                <form onSubmit={handleSendChat} className="pt-2 border-t border-[#182334] flex gap-1.5 shrink-0">
                  <input
                    type="text"
                    placeholder="Napisz na czacie jako streamer..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-[#090d15] text-xs text-white px-3 py-1.5 rounded-xl border border-[#1c283a] focus:border-cyan-400 outline-none placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black font-extrabold transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>

            </div>

          </div>
        </main>

      </div>

    </div>
  );
};

export default Dashboard;