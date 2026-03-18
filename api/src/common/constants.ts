import { Role } from '../prisma/generated/enums';

export const CONSTRAINTS = {
	password: {
		regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>/?\\|[\]~`]).*$/,
		minLength: 12,
		maxLength: 128,
		message: {
			regex: 'Password must contain uppercase, lowercase, a number and a special character',
		},
	},
	username: {
		regex: /^[a-zA-Z0-9_-]+$/,
		minLength: 3,
		maxLength: 30,
		message: {
			regex: 'Username can only contain letters, numbers, underscores and hyphens',
		},
	},
};

export const EXAMPLES = {
	jwtToken:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNDAwMDAwMH0.signature',
	date: '2024-01-01T00:00:00.000Z',
	role: Role.USER,
	id: '550e8400-e29b-41d4-a716-446655440000',
	password: 'Password123!',
	email: 'admin@example.com',
	username: 'admin',
	avatarUrl: '/uploads/avatars/default.svg',
	usernameSearch: 'adm',
	elo: 1400,
	totalGames: 20,
	wins: 14,
	losses: 2,
	draws: 3,
	isOnline: true,
	lastSeen: '2024-01-15T14:30:00.000Z',
};
