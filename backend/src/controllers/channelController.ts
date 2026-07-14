import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db';

// Tworzenie nowego kanału dla zalogowanego użytkownika
export const createChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id; // Pobierane z tokenu JWT przez middleware
    const { displayName, bio } = req.body;

    // Generujemy unikalny klucz streamu bez myślników (np. live_a1b2c3d4e5f6...)
    const streamKey = `live_${uuidv4().replace(/-/g, '')}`;

    await pool.query(
      'INSERT INTO channels (user_id, display_name, bio, stream_key) VALUES (?, ?, ?, ?)',
      [userId, displayName, bio, streamKey]
    );

    res.status(201).json({ 
      message: 'Kanał został pomyślnie utworzony!', 
      channel: { displayName, streamKey } 
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Posiadasz już kanał lub ta nazwa jest zajęta.' });
    } else {
      res.status(500).json({ error: 'Błąd podczas tworzenia kanału.', details: error.message });
    }
  }
};

// Pobieranie aktualnego klucza streamu
export const getMyStreamKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const [rows]: any = await pool.query(
      'SELECT stream_key FROM channels WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Nie znaleziono kanału dla tego użytkownika.' });
      return;
    }

    res.status(200).json({ streamKey: rows[0].stream_key });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera.' });
  }
};