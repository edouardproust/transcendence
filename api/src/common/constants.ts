export const ENUMS = {
	roles: ['user', 'admin'],
};

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
	admin: {
		role: ENUMS.roles[1],
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
		isOnline: false,
		lastSeen: '2024-01-15T14:30:00.000Z',
	},
	user: {
		role: ENUMS.roles[0],
		id: '550e8400-e29b-41d4-a716-446655440001',
		email: 'john@example.com',
		username: 'john_doe',
		password: 'Password123!',
		avatarUrl: '/uploads/avatars/default.svg',
		usernameSearch: 'joh',
		elo: 1400,
		totalGames: 10,
		wins: 6,
		losses: 3,
		draws: 1,
		isOnline: true,
		lastSeen: null,
	},
};
