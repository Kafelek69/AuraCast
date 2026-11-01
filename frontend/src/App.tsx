import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { WhispersDrawer } from './components/WhispersDrawer';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)] text-[#f1f5f9] font-sans overflow-hidden">
      {/* 🟢 TOP NAVBAR */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* 🟢 COLLAPSIBLE SIDEBAR */}
        <Sidebar />

        {/* 🟢 GŁÓWNA ZAWARTOŚĆ APLIKACJI */}
        <main className="flex-1 flex overflow-hidden bg-[var(--bg-base)]">
          <Outlet />
        </main>
      </div>

      {/* 🟢 FLOATING WHISPERS DRAWER */}
      <WhispersDrawer />
    </div>
  );
};

export default App;