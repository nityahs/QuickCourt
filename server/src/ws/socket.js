import { Server } from 'socket.io';
let _io;
export const initSocket = (httpServer) => {
  _io = new Server(httpServer, { cors: { origin: process.env.CLIENT_ORIGIN } });
  _io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
  });
};
export const io = () => _io;