import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:4000');

interface ChatMessage {
  username: string;
  message: string;
}

const Channel: React.FC = () => {
  const { channelName } = useParams<{ channelName: string }>();
  const currentChannel = channelName || 'default-room';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const myUsername = `Widz_${Math.floor(Math.random() * 1000)}`;

  useEffect(() => {
    setMessages([]);
    socket.emit('joinChannel', currentChannel);

    const handleNewMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };
    
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [currentChannel]); 

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    socket.emit('sendMessage', {
      channelId: currentChannel,
      username: myUsername,
      message: inputValue
    });
    setInputValue('');
  };

  return (
    <div className="flex w-full h-full bg-[#0f0f13]">
      
      {/* 🔵 ODTWARZACZ I INFORMACJE */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="w-full aspect-video bg-black rounded-xl border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <span className="text-gray-500 font-bold uppercase tracking-widest">
            Łączenie z serwerem wideo dla: <span className="text-blue-500">{currentChannel}</span>
          </span>
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">NA ŻYWO</div>
        </div>
        
        <div className="mt-6 flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-[#18181b] border-2 border-blue-500 rounded-full flex items-center justify-center text-xl font-bold uppercase text-blue-500 shadow-lg shadow-blue-500/20">
              {currentChannel.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{currentChannel} - Transmisja na żywo</h1>
              <p className="text-blue-500 font-bold mt-1 cursor-pointer hover:underline">@{currentChannel}</p>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
            Obserwuj
          </button>
        </div>
      </div>

      {/* 🔵 CZAT */}
      <aside className="w-[340px] bg-[#18181b] border-l border-gray-800 flex flex-col shrink-0 shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1f1f23]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">Czat: {currentChannel}</h2>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-10 italic">Napisz coś jako pierwszy!</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className="text-sm hover:bg-[#27272a] px-2 py-1 -mx-2 rounded transition-colors break-words">
              <span className="font-bold text-blue-400 mr-2">{msg.username}:</span>
              <span className="text-gray-200">{msg.message}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-[#1f1f23]">
          <input 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            className="w-full bg-[#27272a] text-sm text-white px-4 py-3 rounded-lg outline-none focus:border-blue-500 border border-transparent transition-all placeholder-gray-500" 
            placeholder={`Wyślij wiadomość na ${currentChannel}...`} 
          />
        </form>
      </aside>
    </div>
  );
};

export default Channel;