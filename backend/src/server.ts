import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import channelRoutes from './routes/channelRoutes';
import { setupChat } from './sockets/chatHandler';
import nms from './rtmp/mediaServer';

dotenv.config();

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || '*';

// Inicjalizacja Socket.io z dynamicznym CORS
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 4000;

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());

// Ścieżki API
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);

// Endpoint Healthcheck dla Docker / K8s / Cloud
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.status(200).json({ status: 'ok', message: 'API, Baza danych i Czat działają!', uptime: process.uptime() });
  } catch (error) {
    res.status(200).json({ status: 'degraded', message: 'API działa w trybie awaryjnym (Baza danych w trakcie łączenia)', uptime: process.uptime() });
  }
});

// Konfiguracja czatu Socket.io
setupChat(io);

// Start serwera HTTP + WebSocket
server.listen(port, () => {
  console.log(`🚀 AuraCast API oraz Live Chat (WebSockets) uruchomione na porcie ${port}`);
});

// Start serwera RTMP (NodeMediaServer)
try {
  nms.run();
  console.log(`🎥 AuraCast RTMP Media Server uruchomiony na porcie 1935 (HTTP-FLV na 8000)`);
} catch (e) {
  console.error('NodeMediaServer start notice:', e);
}