import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Do generowania bezpiecznych kluczy streamu
import pool from '../config/db';

const router = express.Router();

// 🟢 REJESTRACJA
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // 1. Hashujemy hasło
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 2. Tworzymy użytkownika w bazie (zwróci nam jego nowe ID)
    const [userResult]: any = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );
    
    const userId = userResult.insertId;

    // 3. Generujemy super-bezpieczny klucz strumienia (np. live_8f7a2b...)
    const streamKey = `live_${crypto.randomBytes(16).toString('hex')}`;

    // 4. Od razu zakładamy mu kanał w tabeli channels!
    await pool.query(
      'INSERT INTO channels (user_id, display_name, stream_key) VALUES (?, ?, ?)',
      [userId, username, streamKey]
    );

    res.status(201).json({ message: 'Konto założone! Możesz się teraz zalogować.' });
  } catch (error: any) {
    console.error(error);
    // Jeśli kod błędu to ER_DUP_ENTRY, ktoś już zajął ten email lub nick
    res.status(500).json({ error: 'Błąd rejestracji. Nick lub E-mail może być już zajęty.' });
  }
});

// 🔵 LOGOWANIE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 1. Szukamy gościa po mailu
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ error: 'Nie znaleziono takiego konta.' });

    const user = users[0];

    // 2. Sprawdzamy, czy hasło z formularza pasuje do tego z bazy
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Błędne hasło.' });

    // 3. Wystawiamy bilet (Token JWT) na 24 godziny
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET || 'auracast_super_tajny_sekret_123', 
      { expiresIn: '24h' }
    );

    // 4. Zwracamy token i podstawowe dane na frontend
    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Wystąpił błąd serwera podczas logowania.' });
  }
});

export default router;