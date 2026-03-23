import { Role } from '../prisma/generated/enums';

export const DEFAULTS = {
	avatar: {
		localPath: 'src/storage/assets/default-avatar.svg',
		remoteKey: 'avatars/default.svg',
		contentType: 'image/svg+xml',
	},
	pagination: {
		page: 1,
		limit: 20,
	},
};

export const CONSTRAINTS = {
	user: {
		email: {
			regex: /\S+@\S+\.\S+/,
		},
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
		search: {
			minLength: 2,
		},
		avatar: {
			fileType: /image\/(jpeg|png|webp|svg\+xml)/,
			maxSize: 1024 * 1024,
		},
	},
};

export const EXAMPLES = {
	jwtToken:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNDAwMDAwMH0.signature',
	date: '2024-01-01T00:00:00.000Z',
	role: Role.USER,
	id: '550e8400-e29b-41d4-a716-446655440000',
	id2: '550e8400-e29b-41d4-a716-446655440001',
	password: 'Password123!',
	email: 'user1@example.com',
	username: 'user1',
	username2: 'user2',
	avatarUrl: `https://example.com/${DEFAULTS.avatar.remoteKey}`,
	usernameSearch: 'use',
	elo: 1400,
	totalGames: 20,
	wins: 10,
	losses: 7,
	draws: 3,
	isOnline: true,
	lastSeen: '2024-01-15T14:30:00.000Z',
	timeControl: '10+0',
};
