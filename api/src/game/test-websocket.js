const { io } = require('socket.io-client');

// ===== CONFIG =====
const URL = 'http://localhost:3001';
const TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYjBkY2I3YS1hY2ZjLTRlMDMtOThjOC01NTQ3NjViNzVjN2UiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3NDg4Mjg2NiwiZXhwIjoxNzc0OTY5MjY2fQ.HMEjq0DZffpCpMU4BlTtk_kVsYcwHd0IylrejMOLgBQ';

// ===== SOCKET INIT =====
const socket = io(URL, {
	transports: ['websocket'],
	auth: {
		token: TOKEN,
	},
});

// ===== CONNECTION =====
socket.on('connect', () => {
	console.log('Connected:', socket.id);

	console.log('Sending ping...');
	socket.emit('ping');
});

// ===== RESPONSE =====
socket.on('pong', (data) => {
	console.log('Pong received:');
	console.dir(data, { depth: null });
});

// ===== ERRORS =====
socket.on('connect_error', (err) => {
	console.error('Connection error:', err.message);
});

socket.on('disconnect', (reason) => {
	console.log('🔌 Disconnected:', reason);
});
