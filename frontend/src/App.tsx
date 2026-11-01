import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { WhispersDrawer } from './components/WhispersDrawer';

const App: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return (
      <div className="flex flex-col h-screen bg-[#090d14] text-[#f1f5f9] font-sans overflow-hidden">
        <main className="flex-1 flex overflow-hidden">
          <Outlet />
        </main>
        <WhispersDrawer />
      </div>
    );
  }

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