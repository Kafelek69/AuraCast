import React, { useState } from 'react';
import { EMOTE_LIST, type EmoteInfo } from '../utils/emotes';
import { Smile, Search, X } from 'lucide-react';

interface EmotePickerProps {
  onSelect: (emoteCode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EmotePicker: React.FC<EmotePickerProps> = ({ onSelect, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'Wszystkie' | 'Popularne' | 'Klasyczne' | 'Memy'>('Wszystkie');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredEmotes = EMOTE_LIST.filter((emote: EmoteInfo) => {
    const matchesSearch = emote.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'Wszystkie' || emote.group === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="absolute bottom-14 right-2 z-50 w-72 sm:w-80 bg-[#18181b] border border-[#27272e] rounded-xl shadow-2xl p-3 flex flex-col text-[#efeff1] backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#27272e]">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
          <Smile className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Emotki Czatowe</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#27272e] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Wyszukiwarka emotek */}
      <div className="relative mt-2 mb-2">
        <input 
          type="text"
          placeholder="Szukaj emotki..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#121214] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#27272e] focus:border-[var(--brand-primary)] outline-none"
        />
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-2 text-[11px] font-semibold">
        {(['Wszystkie', 'Popularne', 'Klasyczne', 'Memy'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeTab === tab 
                ? 'bg-[var(--brand-primary)] text-[var(--brand-contrast)] font-bold' 
                : 'bg-[#222226] text-gray-300 hover:bg-[#2a2a30]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid emotek */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
        {filteredEmotes.map((emote: EmoteInfo) => (
          <button
            key={emote.code}
            onClick={() => {
              onSelect(emote.code);
            }}
            title={emote.name}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-[#26262c] hover:scale-110 transition-all duration-150 group"
          >
            <img src={emote.url} alt={emote.name} className="w-7 h-7 object-contain" />
            <span className="text-[9px] text-gray-400 truncate w-full text-center mt-1 group-hover:text-white">
              {emote.code}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
