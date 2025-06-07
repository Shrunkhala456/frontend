// client/src/services/socketService.js
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000'; // Your backend Socket.IO URL
let socket;

export const connectSocket = (userId) => {
    if (!socket || !socket.connected) { // Prevent multiple connections
        socket = io(ENDPOINT, {
            query: { userId: userId },
            transports: ['websocket', 'polling'] // Prefer websocket
        });

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server!', socket.id);
            socket.emit('joinRoom', userId); // Join a room specific to this user ID
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from Socket.IO server:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.warn('Socket not initialized. Call connectSocket first.');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null; // Clear the socket instance
    }
};