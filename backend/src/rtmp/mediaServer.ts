import NodeMediaServer from 'node-media-server';
import pool from '../config/db';

const config = {
  rtmp: { port: 1935, chunk_size: 60000, gop_cache: true, ping: 30, ping_timeout: 60 },
  http: { port: 8000, allow_origin: '*' }
};

const nms = new NodeMediaServer(config);
const sessionMap = new Map<string, string>();
const originalLog = console.log;

console.log = function (...args: any[]) {
  originalLog.apply(console, args);
  const logString = args.join(' ');

  // 🟢 ŁAPIEMY START STREAMU
  if (logString.includes('start push /live/')) {
    const sessionMatch = logString.match(/RTMP session ([a-zA-Z0-9]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : null;

    // Bierzemy czysty nick, ignorując wszystko inne
    const channelName = logString.split('/live/')[1]?.split(' ')[0]?.trim();

    if (sessionId && channelName) {
      // ZABEZPIECZENIE: Sprawdzamy, czy użytkownik w ogóle ma konto w AuraCast
      pool.query('SELECT * FROM channels WHERE display_name = ?', [channelName])
        .then(([rows]: any) => {
          if (rows.length === 0) {
            originalLog(`\n[🚨 ZABEZPIECZENIE] Odrzucono! Kanał ${channelName} nie istnieje w bazie.\n`);
          } else {
            sessionMap.set(sessionId, channelName);
            pool.query('UPDATE channels SET is_live = true WHERE display_name = ?', [channelName]).catch(() => {});
            originalLog(`\n[🟢 SYSTEM ZŁAMANY] Status LIVE włączony dla: ${channelName}\n`);
          }
        }).catch(() => {});
    }
  }

  // 🛑 ŁAPIEMY KONIEC STREAMU
  if (logString.includes('close') && logString.includes('RTMP session')) {
    const sessionMatch = logString.match(/RTMP session ([a-zA-Z0-9]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : null;

    if (sessionId && sessionMap.has(sessionId)) {
      const channelName = sessionMap.get(sessionId) || '';
      sessionMap.delete(sessionId);
      pool.query('UPDATE channels SET is_live = false WHERE display_name = ?', [channelName]).catch(() => {});
      originalLog(`\n[🛑 ZAKOŃCZONO] Status OFFLINE dla: ${channelName}\n`);
    }
  }
};

export default nms;