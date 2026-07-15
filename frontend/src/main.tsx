import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Channel from './pages/Channel';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Strona główna */}
          <Route index element={<Home />} />
          
          {/* Sztywne ścieżki (MUSZĄ BYĆ WYŻEJ) */}
          <Route path="auth" element={<Auth />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Ścieżka dynamiczna dla kanałów (MUSI BYĆ NA SAMYM DOLE) */}
          <Route path=":channelName" element={<Channel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);