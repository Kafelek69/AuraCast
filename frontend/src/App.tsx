import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Search, Bell, User, Gamepad2, Code } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-[#0f0f13] text-gray-100 font-sans overflow-hidden">
      {/* 🔵 NAVBAR */}
      <header className="h-14 bg-[#18181b] border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center space-x-6 w-1/3">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all">A</div>
            <span className="text-xl font-bold tracking-tight hidden sm:block group-hover:text-blue-400 transition-colors">AuraCast</span>
          </Link>
        </div>
        <div className="flex-1 max-w-md flex justify-center w-1/3">
          <div className="relative w-full">
            <input type="text" placeholder="Szukaj transmisji..." className="w-full bg-[#27272a] text-sm pl-10 pr-4 py-1.5 rounded-full border border-transparent focus:border-blue-500 outline-none transition-all" />
            <Search className="absolute left-3 top-2 text-gray-400 w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-4 w-1/3">
          <Bell className="w-5 h-5 text-gray-300 hover:text-blue-400 cursor-pointer transition-colors" />
          <User className="w-5 h-5 text-gray-300 hover:text-blue-400 cursor-pointer transition-colors" />
          <button className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full transition-colors">Streamuj</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 🔵 SIDEBAR */}
        <aside className="w-64 bg-[#1f1f23] flex flex-col hidden lg:flex shrink-0 border-r border-gray-800">
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Polecane Kanały</h3>
            <div className="space-y-2">
              
              <Link to="/devninja" className="flex items-center justify-between p-2 hover:bg-[#27272a] rounded-lg group">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-700 rounded-full border-2 border-blue-500"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors">DevNinja</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Code className="w-3 h-3"/> Programowanie</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-300">1.2k</span>
                </div>
              </Link>

              <Link to="/globalelite" className="flex items-center justify-between p-2 hover:bg-[#27272a] rounded-lg group">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-700 rounded-full border-2 border-purple-500"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors">GlobalElite</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Gamepad2 className="w-3 h-3"/> Counter-Strike 2</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-300">8.4k</span>
                </div>
              </Link>

            </div>
          </div>
        </aside>

        {/* 🔵 GŁÓWNA ZAWARTOŚĆ */}
        <main className="flex-1 flex overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;