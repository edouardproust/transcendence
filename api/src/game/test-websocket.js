const { io } = require('socket.io-client');
// for now just go to prisma studio and copy the data by hand...
const GAME_ID = 'fbf59960-edc3-47b8-9c67-8d41ed798c32';
const USER_ID = '9e97db5f-c165-45b3-a025-dfc8389e45e0';
const MOVE = 'e5';

const socket = io('http://localhost:3001', {
	transports: ['websocket'],
});

socket.on('connect', () => {
	console.log('✅ connected:', socket.id);
	socket.emit('joinGame', { gameId: GAME_ID });

	setTimeout(() => {
		console.log('♟️ Sending move...');
		socket.emit('makeMove', {
			gameId: GAME_ID,
			move: MOVE,
			userId: USER_ID,
		});
	}, 2000);
});

socket.on('gameUpdate', (data) => {
	console.log('♟️ Game update:');
	console.dir(data, { depth: null });
});

socket.on('error', (err) => {
	console.error('❌ Error:', err);
});

socket.on('connect_error', (err) => {
	console.error('❌ Connection error:', err.message);
});
