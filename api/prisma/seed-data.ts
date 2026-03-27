import * as bcrypt from 'bcrypt';
import { GameMode, GameStatus, Role } from '../src/prisma/generated/enums';
import { Game, PrismaClient, User } from '../src/prisma/generated/client';
import { EXAMPLES } from '../src/common/constants';

export const seedUsers = async (prisma: PrismaClient) => {
	const result: User[] = [];

	const user = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			email: 'admin@example.com',
			password: await bcrypt.hash(EXAMPLES.password, 10),
			username: 'admin',
			role: Role.ADMIN,
		},
	});
	result.push(user);

	for (let i = 1; i <= 20; i++) {
		const user = await prisma.user.upsert({
			where: { email: `user${i}@example.com` },
			update: {},
			create: {
				email: `user${i}@example.com`,
				password: await bcrypt.hash(EXAMPLES.password, 10),
				username: `user${i}`,
				role: Role.USER,
				elo: EXAMPLES.elo + i * 10,
			},
		});
		result.push(user);
	}

	return result;
};

export const seedGames = async (prisma: PrismaClient, users: User[]) => {
	const [admin, ...regularUsers] = users;

	const games = [
		// FINISHED games avec winner
		{
			whiteId: regularUsers[0].id,
			blackId: regularUsers[1].id,
			winnerId: regularUsers[0].id,
			status: GameStatus.FINISHED,
			mode: GameMode.ONLINE,
			timeControl: '10+0',
			pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5',
		},
		{
			whiteId: regularUsers[2].id,
			blackId: regularUsers[3].id,
			winnerId: regularUsers[3].id,
			status: GameStatus.FINISHED,
			mode: GameMode.ONLINE,
			timeControl: '5+3',
		},
		// ONGOING games
		{
			whiteId: regularUsers[4].id,
			blackId: regularUsers[5].id,
			status: GameStatus.ONGOING,
			mode: GameMode.ONLINE,
			timeControl: '15+10',
			currentFen:
				'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
		},
		{
			whiteId: admin.id,
			blackId: regularUsers[6].id,
			status: GameStatus.ONGOING,
			mode: GameMode.ONLINE,
			timeControl: '3+2',
		},
		// WAITING games (pas de black encore)
		{
			whiteId: regularUsers[7].id,
			status: GameStatus.WAITING,
			mode: GameMode.ONLINE,
			timeControl: 'unlimited',
		},
		{
			whiteId: regularUsers[8].id,
			status: GameStatus.WAITING,
			mode: GameMode.ONLINE,
			timeControl: '10+0',
		},
		// ABORTED games
		{
			whiteId: regularUsers[9].id,
			blackId: regularUsers[10].id,
			status: GameStatus.ABORTED,
			mode: GameMode.ONLINE,
			timeControl: '5+0',
		},
		// AI games
		{
			whiteId: regularUsers[0].id,
			status: GameStatus.FINISHED,
			mode: GameMode.AI,
			timeControl: 'unlimited',
			winnerId: regularUsers[0].id,
		},
		{
			whiteId: regularUsers[1].id,
			status: GameStatus.ONGOING,
			mode: GameMode.AI,
			timeControl: 'unlimited',
		},
	];

	const result: Game[] = [];
	for (const game of games) {
		const created = await prisma.game.create({ data: game });
		result.push(created);
	}
	return result;
};
