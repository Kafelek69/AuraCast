import express from 'express';
import pool from '../config/db';

const router = express.Router();

// 🟢 1. PUBLICZNE DANE (Dla odtwarzacza wideo i widzów - bez tajnego klucza!)
router.get('/:name', async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT display_name, current_category, is_live, avatar_url, offline_banner FROM channels WHERE display_name = ?', 
      [req.params.name]
    );
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Kanał nie istnieje' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
});

// 🔴 2. PRYWATNE DANE (Dla Panelu Twórcy - zawiera stream_key!)
router.get('/private/:name', async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT title, current_category, stream_key, offline_banner FROM channels WHERE display_name = ?', 
      [req.params.name]
    );
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Kanał nie istnieje' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
});

// 🔵 3. ZAPISYWANIE USTAWIEŃ Z PANELU
router.put('/settings', async (req, res) => {
  const { name, title, current_category, offline_banner } = req.body;
  
  try {
    await pool.query(
      'UPDATE channels SET title = ?, current_category = ?, offline_banner = ? WHERE display_name = ?', 
      [title, current_category, offline_banner, name]
    );
    res.json({ success: true, message: 'Ustawienia zapisane!' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas zapisywania' });
  }
});

export default router;