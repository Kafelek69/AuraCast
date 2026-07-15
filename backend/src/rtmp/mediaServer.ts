import NodeMediaServer from 'node-media-server';
import pool from '../config/db';

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};

const nms = new NodeMediaServer(config);

// 🟢 UŻYWAMY postPublish – to zdarzenie zawsze dostaje poprawną ścieżkę
nms.on('postPublish', async (id: string, StreamPath: string, args: any) => {
  console.log(`[DEBUG] Złapano strumień w postPublish! Ścieżka: ${StreamPath}`);
  
  if (!StreamPath) return;
  
  const channelName = StreamPath.split('/')[2]; 
  
  try {
    // Aktualizujemy bazę, że kanał jest na żywo
    await pool.query('UPDATE channels SET is_live = true WHERE display_name = ?', [channelName]);
    console.log(`[RTMP 🟢] Kanał ${channelName} jest teraz LIVE!`);
  } catch (error) {
    console.error('[RTMP 🔴] Błąd aktualizacji bazy:', error);
  }
});

nms.on('donePublish', async (id: string, StreamPath: string, args: any) => {
  if (!StreamPath) return;
  const channelName = StreamPath.split('/')[2];
  
  try {
    await pool.query('UPDATE channels SET is_live = false WHERE display_name = ?', [channelName]);
    console.log(`[RTMP 🛑] Stream ${channelName} zakończony.`);
  } catch (error) {
    console.error(error);
  }
});

export default nms;