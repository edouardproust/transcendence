import { GameMode, GameStatus } from '../../src/prisma/generated/enums';
import { Game, PrismaClient, User } from '../../src/prisma/generated/client';

export const seedGames = async (
	prisma: PrismaClient,
	admin: User,
	users: User[],
): Promise<Game[]> => {
	const result: Game[] = [];

	const games: Parameters<typeof prisma.game.create>[0]['data'][] = [
		// --- FINISHED games ---
		{
			whiteId: users[0].id,
			blackId: users[1].id,
			winnerId: users[0].id,
			status: GameStatus.FINISHED,
			mode: GameMode.ONLINE,
			timeControl: '10+0',
			pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O',
		},
		{
			whiteId: users[2].id,
			blackId: users[3].id,
			winnerId: users[3].id,
			status: GameStatus.FINISHED,
			mode: GameMode.ONLINE,
			timeControl: '5+3',
			pgn: '1. d4 d5 2. c4 e6 3. Nc3 Nf6',
		},
		{
			whiteId: users[4].id,
			blackId: users[5].id,
			// no winner = draw
			status: GameStatus.FINISHED,
			mode: GameMode.ONLINE,
			timeControl: '15+10',
			pgn: '1. e4 e5 2. Nf3 Nf6',
		},
		{
			whiteId: users[6].id,
			blackId: users[7].id,
			winnerId: users[6].id,
			status: GameStatus.FINISHED,
			mode: GameMode.ONLINE,
			timeControl: '3+2',
		},
		{
			whiteId: users[8].id,
			blackId: users[9].id,
			winnerId: users[9].id,
			status: GameStatus.FINISHED,
			mode: GameMode.ONLINE,
			timeControl: '10+0',
		},
		// --- ABORTED games ---
		{
			whiteId: users[10].id,
			blackId: users[11].id,
			status: GameStatus.ABORTED,
			mode: GameMode.ONLINE,
			timeControl: '5+0',
		},
		{
			whiteId: users[12].id,
			blackId: users[13].id,
			status: GameStatus.ABORTED,
			mode: GameMode.ONLINE,
			timeControl: '10+0',
		},
		// --- AI games (FINISHED) ---
		{
			whiteId: users[0].id,
			status: GameStatus.FINISHED,
			mode: GameMode.AI,
			timeControl: 'unlimited',
			winnerId: users[0].id,
			pgn: '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7',
		},
		{
			whiteId: users[1].id,
			status: GameStatus.FINISHED,
			mode: GameMode.AI,
			timeControl: 'unlimited',
			// no winner = AI won (or draw, depends on your logic)
		},
		// --- ONGOING ---
		{
			whiteId: admin.id,
			blackId: users[14].id,
			status: GameStatus.ONGOING,
			mode: GameMode.ONLINE,
			timeControl: '10+0',
			currentFen:
				'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
			pgn: '1. e4',
		},
	];

	for (const data of games) {
		const game = await prisma.game.create({ data });
		result.push(game);
	}

	console.log(`  ${result.length} games created`);
	return result;
};
