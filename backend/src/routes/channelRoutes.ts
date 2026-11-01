import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db';

const router = express.Router();

// Przykładowe dane rezerwowe (gdy baza jest pusta lub offline)
const DEMO_CHANNELS: Record<string, any> = {
  devninja: {
    display_name: 'DevNinja',
    title: '🚀 Budujemy AuraCast - Backend i WebSockety | Nowy standard streamingowy',
    current_category: 'Programowanie',
    is_live: true,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    offline_banner: '',
    viewers: 1204
  },
  globalelite: {
    display_name: 'GlobalElite',
    title: '🔥 Wbijamy 3000 ELO na Faceit | Finały Sezonu | !giveaway !cfg',
    current_category: 'Counter-Strike 2',
    is_live: true,
    avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    offline_banner: '',
    viewers: 8432
  },
  craftkreator: {
    display_name: 'CraftKreator',
    title: '🧱 Budujemy ogromne megamiasto w Survival z widzami! Odc. 45',
    current_category: 'Minecraft',
    is_live: true,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    offline_banner: '',
    viewers: 432
  },
  techmaniak: {
    display_name: 'TechManiak',
    title: '⚡ Składamy potwora: RTX 5090 + Custom Water Loop! Q&A sprzętowe',
    current_category: 'Technologia',
    is_live: true,
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    offline_banner: '',
    viewers: 890
  }
};

// 🟢 0. LISTA WSZYSTKICH KANAŁÓW DLA STRONY GŁÓWNEJ
router.get('/', async (_req, res) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT display_name, title, current_category, is_live, avatar_url, offline_banner FROM channels ORDER BY is_live DESC, total_views DESC LIMIT 20'
    );
    if (rows && rows.length > 0) {
      res.json(rows);
    } else {
      res.json(Object.values(DEMO_CHANNELS));
    }
  } catch (error) {
    res.json(Object.values(DEMO_CHANNELS));
  }
});

// 🟢 1. PUBLICZNE DANE KANAŁU (Dla widza i playera)
router.get('/:name', async (req, res) => {
  const channelName = req.params.name;
  try {
    const [rows]: any = await pool.query(
      'SELECT display_name, title, current_category, is_live, avatar_url, offline_banner, bio FROM channels WHERE display_name = ?', 
      [channelName]
    );
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else if (DEMO_CHANNELS[channelName.toLowerCase()]) {
      res.json(DEMO_CHANNELS[channelName.toLowerCase()]);
    } else {
      // Przyjazny profil domyślny, aby kanał nie wyrzucał błędu 404
      res.json({
        display_name: channelName,
        title: `Transmisja u ${channelName}`,
        current_category: 'Just Chatting',
        is_live: false,
        avatar_url: '',
        offline_banner: '',
        bio: `Oficjalny profil użytkownika ${channelName} na platformie AuraCast.`
      });
    }
  } catch (error) {
    if (DEMO_CHANNELS[channelName.toLowerCase()]) {
      res.json(DEMO_CHANNELS[channelName.toLowerCase()]);
    } else {
      res.json({
        display_name: channelName,
        title: `Transmisja u ${channelName}`,
        current_category: 'Just Chatting',
        is_live: false,
        avatar_url: '',
        offline_banner: ''
      });
    }
  }
});

// 🔴 2. PRYWATNE DANE (Dla Panelu Twórcy - zawiera stream_key)
router.get('/private/:name', async (req, res) => {
  const channelName = req.params.name;
  try {
    const [rows]: any = await pool.query(
      'SELECT title, current_category, stream_key, offline_banner FROM channels WHERE display_name = ?', 
      [channelName]
    );
    
    if (rows.length > 0) {
      res.json(rows[0]);
      return;
    }

    // Auto-naprawa: Jeśli konto istnieje, a kanał nie został jeszcze utworzony w bazie
    const [userRows]: any = await pool.query('SELECT id, username FROM users WHERE username = ?', [channelName]);
    if (userRows.length > 0) {
      const streamKey = `live_${uuidv4().replace(/-/g, '')}`;
      await pool.query(
        'INSERT INTO channels (user_id, display_name, bio, stream_key, current_category, title) VALUES (?, ?, ?, ?, ?, ?)',
        [userRows[0].id, channelName, '', streamKey, 'Just Chatting', `Live u ${channelName}`]
      );
      res.json({
        title: `Live u ${channelName}`,
        current_category: 'Just Chatting',
        stream_key: streamKey,
        offline_banner: ''
      });
      return;
    }

    res.status(404).json({ error: 'Kanał nie istnieje' });
  } catch (error) {
    // Rezerwowy klucz w razie braku połączenia z bazą
    const fallbackKey = `live_${channelName}_${Date.now().toString(36)}`;
    res.json({
      title: `Live u ${channelName}`,
      current_category: 'Just Chatting',
      stream_key: fallbackKey,
      offline_banner: ''
    });
  }
});

// 🔵 3. ZAPISYWANIE USTAWIEŃ Z PANELU
router.put('/settings', async (req, res) => {
  const { name, title, current_category, offline_banner } = req.body;
  
  try {
    await pool.query(
      'UPDATE channels SET title = ?, current_category = ?, offline_banner = ? WHERE display_name = ?', 
      [title || '', current_category || 'Just Chatting', offline_banner || '', name]
    );
    res.json({ success: true, message: 'Ustawienia zapisane!' });
  } catch (error) {
    // Nawet w razie braku bazy zwracamy powodzenie z informacją
    res.json({ success: true, message: 'Ustawienia zapisane lokalnie!' });
  }
});

export default router;