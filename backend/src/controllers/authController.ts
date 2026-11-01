import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-tajny-klucz-auracast-zmien-na-produkcji';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Wypełnij wszystkie pola formularza.' });
      return;
    }

    // Szyfrowanie hasła
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Zapis użytkownika do bazy danych
    const [result]: any = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    const userId = result.insertId;
    const streamKey = `live_${uuidv4().replace(/-/g, '')}`;

    // Automatyczne tworzenie powiązanego kanału dla nowego użytkownika
    await pool.query(
      'INSERT INTO channels (user_id, display_name, bio, stream_key, current_category, title) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        username,
        `Oficjalny kanał ${username} na AuraCast!`,
        streamKey,
        'Just Chatting',
        `Live u ${username}! Zapraszamy na czat`
      ]
    );

    res.status(201).json({ message: 'Konto oraz Twój kanał zostały pomyślnie utworzone!' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Użytkownik o takiej nazwie lub e-mailu już istnieje.' });
    } else {
      res.status(500).json({ error: 'Błąd serwera podczas rejestracji.' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Szukanie użytkownika w bazie
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      res.status(401).json({ error: 'Nieprawidłowy e-mail lub hasło.' });
      return;
    }

    const user = rows[0];

    // Weryfikacja hasła
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Nieprawidłowy e-mail lub hasło.' });
      return;
    }

    // Generowanie tokenu JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Zalogowano pomyślnie',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera podczas logowania.' });
  }
};