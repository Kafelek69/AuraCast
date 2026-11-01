import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Flame, Compass, Trophy, Video, 
  LogOut, LayoutDashboard, Settings, Radio, Sparkles, MessageSquare, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useWhispersStore } from '../store/whispersStore';

const SEARCH_SUGGESTIONS = [
  { name: 'DevNinja', type: 'streamer', info: 'Programowanie • 1.2k widzów' },
  { name: 'GlobalElite', type: 'streamer', info: 'Counter-Strike 2 • 8.4k widzów' },
  { name: 'CraftKreator', type: 'streamer', info: 'Minecraft • 432 widzów' },
  { name: 'Counter-Strike 2', type: 'game', info: '24.1k widzów na żywo' },
  { name: 'Just Chatting', type: 'game', info: '145.8k widzów na żywo' },
  { name: 'Grand Theft Auto V', type: 'game', info: '89.2k widzów na żywo' }
];

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const { isOpen: whispersOpen, toggleOpen: toggleWhispers, unreadTotal: unreadWhispers } = useWhispersStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (item: typeof SEARCH_SUGGESTIONS[0]) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (item.type === 'streamer') {
      navigate(`/${item.name.toLowerCase()}`);
    } else {
      navigate(`/?category=${encodeURIComponent(item.name)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${searchQuery.trim().toLowerCase()}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="h-14 bg-[var(--bg-header)] border-b border-[var(--border-subtle)] flex items-center justify-between px-3 md:px-5 shrink-0 z-40 select-none relative">
      
      {/* 🟢 LEWA STRONA: LOGO + NAWIGACJA */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-lg tracking-tighter shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight font-display text-white">
              Aura<span className="text-[var(--brand-primary)]">Cast</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-600/40 text-blue-400">
              LIVE
            </span>
          </div>
        </Link>

        {/* Linki nawigacyjne */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-300">
          <Link 
            to="/" 
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Przeglądaj</span>
          </Link>
          <Link 
            to="/?tab=esport" 
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Esport</span>
          </Link>
          <Link 
            to="/?tab=irl" 
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>IRL</span>
          </Link>
        </nav>
      </div>

      {/* 🟢 ŚRODEK: WYSZUKIWARKA */}
      <div className="flex-1 max-w-md mx-3 relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input 
            type="text" 
            placeholder="Szukaj streamerów, gier lub tagów..." 
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            className="w-full bg-[var(--bg-input)] text-xs sm:text-sm pl-9 pr-12 py-2 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all text-white placeholder-gray-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Dropdown z podpowiedziami */}
        {searchOpen && (
          <div className="absolute top-12 left-0 right-0 bg-[#11161d] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-2 z-50 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">
              Polecane wyszukiwania
            </div>
            {SEARCH_SUGGESTIONS
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchSelect(item)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1a222c] flex items-center justify-between text-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {item.type === 'streamer' ? (
                      <Radio className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    )}
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{item.info}</span>
                </button>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 PRAWA STRONA: POWIADOMIENIA + STREAMUJ + PROFIL */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Powiadomienia (Bell) */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors relative"
            title="Powiadomienia"
          >
            <Bell className="w-4 h-4" />
            {unreadCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[var(--brand-primary)] text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                {unreadCount()}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-11 w-80 bg-[#11161d] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-3 z-50 text-xs text-[#f1f5f9] animate-in fade-in duration-150">
              <div className="font-bold text-sm mb-2 pb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Powiadomienia</span>
                  {unreadCount() > 0 && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-bold">
                      {unreadCount()} nowe
                    </span>
                  )}
                </div>
                {unreadCount() > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[10px] text-[var(--brand-primary)] hover:underline font-semibold cursor-pointer"
                  >
                    Oznacz wszystkie
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs">
                  Brak powiadomień
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        markAsRead(item.id);
                        setNotificationsOpen(false);
                        navigate(`/${item.streamerId}`);
                      }}
                      className={`p-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer ${
                        !item.isRead ? 'bg-[#18202a] border-l-2 border-[var(--brand-primary)]' : 'hover:bg-[#151c25] opacity-80'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!item.isRead ? 'bg-red-500' : 'bg-gray-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-gray-200 truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{item.message}</p>
                        <span className="text-[9px] text-gray-500 mt-1 block">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wiadomości prywatne */}
        <button 
          onClick={toggleWhispers}
          className={`relative p-2 rounded-lg transition-colors ${
            whispersOpen 
              ? 'bg-[var(--brand-primary)] text-white shadow-sm' 
              : 'text-gray-300 hover:text-white hover:bg-[var(--bg-card-hover)]'
          }`}
          title="Wiadomości prywatne (Szepty)"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadWhispers() > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
              {unreadWhispers()}
            </span>
          )}
        </button>

        {/* Przycisk Streamuj */}
        <Link 
          to={user ? "/dashboard" : "/auth"}
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Streamuj</span>
        </Link>

        {/* Profil / Logowanie */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-0.5 rounded-full border-2 border-[var(--brand-primary)] hover:opacity-90 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-white font-black text-xs flex items-center justify-center uppercase">
                {user.username.charAt(0)}
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-11 w-56 bg-[#11161d] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-2 z-50 text-xs text-[#f1f5f9] animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{user.username}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-green-900/60 text-green-400 border border-green-700">ONLINE</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Rola: {user.role || 'Twórca'}</span>
                </div>

                <Link
                  to={`/${user.username}`}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#18202a] transition-colors text-gray-200"
                >
                  <Radio className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Mój Kanał</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#18202a] transition-colors text-gray-200"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>Panel Twórcy (Stream)</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#18202a] transition-colors text-gray-200"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Ustawienia</span>
                </Link>

                <div className="my-1 border-t border-[var(--border-subtle)]"></div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Wyloguj się</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link 
              to="/auth" 
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-gray-200 border border-[var(--border-subtle)] transition-colors"
            >
              Zaloguj się
            </Link>
            <Link 
              to="/auth" 
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] hover:bg-blue-500 text-white transition-colors shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            >
              Zarejestruj się
            </Link>
          </div>
        )}

      </div>
    </header>
  );
};
