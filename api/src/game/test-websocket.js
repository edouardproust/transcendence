const { io } = require('socket.io-client');

const socket = io('http://api:3001', {
	transports: ['websocket'],
});

socket.on('connect', () => {
	console.log('✅ connected:', socket.id);
});

socket.on('connect_error', (err) => {
	console.error('❌ Error:', err.message);
});
