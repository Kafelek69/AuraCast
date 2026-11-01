import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  PanelLeftClose, PanelLeftOpen, Gamepad2, 
  Code, MessageSquare, Zap, Heart
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface StreamerItem {
  id: string;
  name: string;
  category: string;
  viewers: string;
  avatar: string;
  isLive: boolean;
  categoryIcon: React.ReactNode;
}

const FOLLOWED_STREAMERS: StreamerItem[] = [
  {
    id: 'devninja',
    name: 'DevNinja',
    category: 'Programowanie',
    viewers: '1.2k',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    isLive: true,
    categoryIcon: <Code className="w-3 h-3 text-blue-400" />
  },
  {
    id: 'globalelite',
    name: 'GlobalElite',
    category: 'Counter-Strike 2',
    viewers: '8.4k',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
    isLive: true,
    categoryIcon: <Gamepad2 className="w-3 h-3 text-orange-400" />
  }
];

const RECOMMENDED_STREAMERS: StreamerItem[] = [
  {
    id: 'craftkreator',
    name: 'CraftKreator',
    category: 'Minecraft',
    viewers: '432',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    isLive: true,
    categoryIcon: <Gamepad2 className="w-3 h-3 text-green-400" />
  },
  {
    id: 'techmaniak',
    name: 'TechManiak',
    category: 'Technologia',
    viewers: '890',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    isLive: true,
    categoryIcon: <Zap className="w-3 h-3 text-yellow-400" />
  },
  {
    id: 'cyberqueen',
    name: 'CyberQueen',
    category: 'Valorant',
    viewers: '3.1k',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    isLive: true,
    categoryIcon: <Gamepad2 className="w-3 h-3 text-purple-400" />
  }
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  const location = useLocation();

  return (
    <aside 
      className={`hidden md:flex flex-col shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] transition-all duration-200 select-none ${
        sidebarCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Top Header z przyciskiem zwijania */}
      <div className={`p-3 flex items-center justify-between border-b border-[var(--border-subtle)] ${sidebarCollapsed ? 'justify-center' : ''}`}>
        {!sidebarCollapsed && (
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>Dla Ciebie</span>
          </span>
        )}
        <button 
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Rozwiń pasek boczny" : "Zwiń pasek boczny"}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Lista kanałów ze scrollem */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-4">
        
        {/* OBSERWOWANE KANAŁY */}
        <div>
          {!sidebarCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Obserwowane kanały
            </div>
          )}

          <div className="space-y-0.5">
            {FOLLOWED_STREAMERS.map((streamer) => {
              const isActive = location.pathname === `/${streamer.id}`;
              return (
                <Link
                  key={streamer.id}
                  to={`/${streamer.id}`}
                  className={`group relative flex items-center px-2 py-1.5 mx-1 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[var(--bg-card-hover)] border-l-4 border-[var(--brand-primary)]' 
                      : 'hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={streamer.avatar} 
                      alt={streamer.name} 
                      className="w-8 h-8 rounded-full object-cover border border-[#2e343d] group-hover:border-[var(--brand-primary)] transition-colors"
                    />
                    {streamer.isLive && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-[var(--bg-sidebar)] rounded-full"></span>
                    )}
                  </div>

                  {!sidebarCollapsed && (
                    <div className="ml-2.5 flex-1 min-w-0 flex items-center justify-between">
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-200 group-hover:text-[var(--brand-primary)] truncate transition-colors">
                          {streamer.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                          {streamer.categoryIcon}
                          <span>{streamer.category}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 pl-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-gray-300">{streamer.viewers}</span>
                      </div>
                    </div>
                  )}

                  {/* Tooltip przy zwiniętym pasku */}
                  {sidebarCollapsed && (
                    <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-[#1a1e24] text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-[var(--border-subtle)]">
                      <p className="font-bold">{streamer.name}</p>
                      <p className="text-[10px] text-[var(--brand-primary)]">{streamer.category} • {streamer.viewers} widzów</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* POLECANE KANAŁY */}
        <div>
          {!sidebarCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Polecane kanały
            </div>
          )}

          <div className="space-y-0.5">
            {RECOMMENDED_STREAMERS.map((streamer) => {
              const isActive = location.pathname === `/${streamer.id}`;
              return (
                <Link
                  key={streamer.id}
                  to={`/${streamer.id}`}
                  className={`group relative flex items-center px-2 py-1.5 mx-1 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[var(--bg-card-hover)] border-l-4 border-[var(--brand-primary)]' 
                      : 'hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={streamer.avatar} 
                      alt={streamer.name} 
                      className="w-8 h-8 rounded-full object-cover border border-[#2e343d] group-hover:border-[var(--brand-primary)] transition-colors"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-[var(--bg-sidebar)] rounded-full"></span>
                  </div>

                  {!sidebarCollapsed && (
                    <div className="ml-2.5 flex-1 min-w-0 flex items-center justify-between">
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-200 group-hover:text-[var(--brand-primary)] truncate transition-colors">
                          {streamer.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                          {streamer.categoryIcon}
                          <span>{streamer.category}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 pl-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-gray-300">{streamer.viewers}</span>
                      </div>
                    </div>
                  )}

                  {/* Tooltip przy zwiniętym pasku */}
                  {sidebarCollapsed && (
                    <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-[#1a1e24] text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-[var(--border-subtle)]">
                      <p className="font-bold">{streamer.name}</p>
                      <p className="text-[10px] text-[var(--brand-primary)]">{streamer.category} • {streamer.viewers} widzów</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* SZYBKIE KATEGORIE NA DOLE */}
        {!sidebarCollapsed && (
          <div className="px-3 pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Kategorie na topie
            </div>
            <div className="space-y-1">
              <Link to="/?category=Just+Chatting" className="flex items-center gap-2 p-1.5 text-xs text-gray-300 hover:text-white hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
                <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                <span>Just Chatting</span>
              </Link>
              <Link to="/?category=Counter-Strike+2" className="flex items-center gap-2 p-1.5 text-xs text-gray-300 hover:text-white hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
                <Gamepad2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Counter-Strike 2</span>
              </Link>
              <Link to="/?category=Programowanie" className="flex items-center gap-2 p-1.5 text-xs text-gray-300 hover:text-white hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
                <Code className="w-3.5 h-3.5 text-blue-400" />
                <span>Programowanie</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
