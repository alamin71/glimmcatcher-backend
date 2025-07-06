import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

// Helper: Send notification to a specific user
export const sendUserNotification = (
  io: Server,
  userId: string,
  notification: any,
) => {
  io.to(userId).emit('notification', notification);
};

// Helper: Send notification to all admins
export const sendAdminNotification = (io: Server, notification: any) => {
  io.to('admin').emit('notification', notification);
};

const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Online users
  const onlineUser = new Set<string>();

  io.on('connection', (socket: any) => {
    console.log('connected', socket?.id);

    try {
      const userId = socket.handshake.auth?.userId || socket.id;
      const isAdmin = socket.handshake.auth?.isAdmin || false;

      socket.join(userId);
      if (isAdmin) {
        socket.join('admin');
      }
      onlineUser.add(userId);

      io.emit('onlineUser', Array.from(onlineUser));

      socket.on('disconnect', () => {
        onlineUser.delete(userId);
        io.emit('onlineUser', Array.from(onlineUser));
        console.log('disconnect user ', socket.id);
      });

      // Example: Listen for a test notification event from client
      socket.on('test-notification', (data: any) => {
        sendUserNotification(io, userId, {
          title: 'Test Notification',
          message: data?.message || 'Hello!',
          type: 'info',
        });
      });
    } catch (error) {
      console.error('-- socket.io connection error --', error);
    }
  });

  return io;
};

export default initializeSocketIO;
