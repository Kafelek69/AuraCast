import React, { useState, useRef, useEffect } from 'react';
import { useWhispersStore } from '../store/whispersStore';
import { 
  X, Send, MessageSquare, Search, Circle, Minus, Maximize2 
} from 'lucide-react';

export const WhispersDrawer: React.FC = () => {
  const { 
    isOpen, 
    setOpen, 
    conversations, 
    activeConversationId, 
    setActiveConversation, 
    sendMessage 
  } = useWhispersStore();

  const [inputVal, setInputVal] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputVal.trim());
    setInputVal('');
  };

  const filteredConversations = conversations.filter((c) =>
    c.username.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className={`fixed bottom-0 right-4 z-50 w-full sm:w-[480px] bg-[#11161d] border border-[var(--border-subtle)] rounded-t-2xl shadow-2xl flex flex-col text-[#f1f5f9] transition-all duration-200 ${isMinimized ? 'h-12' : 'h-[440px]'}`}>
      
      {/* Nagłówek okna szeptów */}
      <div className="h-12 px-4 bg-[#141b24] border-b border-[var(--border-subtle)] rounded-t-2xl flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--brand-primary)]" />
          <span className="font-extrabold text-xs tracking-wider uppercase">
            Wiadomości Prywatne
          </span>
          {activeConv && !isMinimized && (
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
              • <span>{activeConv.username}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1f2835] transition-colors"
            title={isMinimized ? "Przywróć" : "Zminimalizuj"}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={() => setOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1f2835] transition-colors"
            title="Zamknij"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-1 overflow-hidden">
          
          {/* Lewa kolumna: Lista konwersacji */}
          <div className="w-44 border-r border-[var(--border-subtle)] flex flex-col bg-[#0e1218]">
            <div className="p-2 border-b border-[var(--border-subtle)]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Szukaj..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-[#151c26] text-[11px] pl-6 pr-2 py-1 rounded-lg border border-[var(--border-subtle)] outline-none focus:border-[var(--brand-primary)]"
                />
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-2" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
              {filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`w-full text-left p-1.5 rounded-xl flex items-center gap-2 transition-all ${
                      isSelected 
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm' 
                        : 'hover:bg-[#17202c] text-gray-300'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={conv.avatar} alt={conv.username} className="w-7 h-7 rounded-full object-cover" />
                      {conv.online && (
                        <Circle className="w-2 h-2 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5 bg-[#0e1218] rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold truncate">{conv.username}</span>
                        {conv.unread && !isSelected && (
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        )}
                      </div>
                      <p className={`text-[9px] truncate ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prawa kolumna: Czat z aktywnym użytkownikiem */}
          <div className="flex-1 flex flex-col bg-[#11161d]">
            {activeConv ? (
              <>
                {/* Wiadomości */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 text-xs">
                  <div className="text-center py-2 text-[10px] text-gray-400">
                    Początek bezpiecznej konwersacji z <span className="font-bold text-white">{activeConv.username}</span>
                  </div>

                  {activeConv.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`px-3 py-1.5 rounded-2xl max-w-[85%] text-xs break-words leading-relaxed ${
                          m.isMe
                            ? 'bg-[var(--brand-primary)] text-white rounded-br-xs'
                            : 'bg-[#18212c] text-gray-200 border border-[var(--border-subtle)] rounded-bl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-0.5 px-1">{m.time}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input wysyłania */}
                <form onSubmit={handleSend} className="p-2 bg-[#0e1218] border-t border-[var(--border-subtle)] flex gap-1.5">
                  <input
                    type="text"
                    placeholder={`Napisz do @${activeConv.username}...`}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="flex-1 bg-[#151c26] text-xs px-3 py-2 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none text-white placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim()}
                    className="p-2 rounded-xl bg-[var(--brand-primary)] hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                Wybierz użytkownika, aby rozpocząć rozmowę
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
