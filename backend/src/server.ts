import express, { Request, Response } from 'express';
import http from 'http'; // 🟢 Importujemy wbudowany moduł HTTP
import { Server } from 'socket.io'; // 🟢 Importujemy Socket.io
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import channelRoutes from './routes/channelRoutes';
import { setupChat } from './sockets/chatHandler'; // 🟢 Importujemy nasz czat
import nms from './rtmp/mediaServer';

dotenv.config();

const app = express();
// 🟢 Tworzymy serwer HTTP na bazie Expressa
const server = http.createServer(app); 

// 🟢 Inicjalizacja Socket.io z ustawieniami CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Na produkcji zmienisz to na domenę swojego frontendu
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ścieżki API
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);

// Endpoint testowy
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.status(200).json({ status: 'ok', message: 'API i Czat działają!' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Brak połączenia z bazą danych.' });
  }
});

// 🟢 Odpalamy logikę czatu
setupChat(io);

// 🟢 ZMIANA: Uruchamiamy "server.listen" zamiast "app.listen"
server.listen(port, () => {
  console.log(`🚀 AuraCast API oraz Live Chat (WebSockets) uruchomione na porcie ${port}`);
});

nms.run();