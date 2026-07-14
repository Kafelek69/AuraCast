import { Server, Socket } from 'socket.io';

export const setupChat = (io: Server) => {
  // Nasłuchujemy na nowe połączenia od widzów
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Nowe połączenie: ${socket.id}`);

    // Kiedy widz wchodzi na transmisję, dołącza do "pokoju" danego streamera
    socket.on('joinChannel', (channelId: string) => {
      socket.join(channelId);
      console.log(`Użytkownik dołączył do czatu kanału: ${channelId}`);
    });

    // Kiedy widz wysyła wiadomość
    socket.on('sendMessage', (data: { channelId: string, username: string, message: string }) => {
      // Rozsyłamy wiadomość do WSZYSTKICH w danym pokoju (czyli na danym streamie)
      io.to(data.channelId).emit('newMessage', {
        username: data.username,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Kiedy widz wychodzi z platformy
    socket.on('disconnect', () => {
      console.log(`❌ Rozłączono: ${socket.id}`);
    });
  });
};