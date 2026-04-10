import { PrismaService } from '../../prisma/prisma.service';
import { GameMode } from '../../prisma/generated/enums';

export enum GameOutcome {
	WHITE_WINS = 'white',
	BLACK_WINS = 'black',
	DRAW = 'draw',
}

export interface EloResult {
	whiteElo: number;
	blackElo: number;
	whiteChange: number;
	blackChange: number;
}

export const calculateExpected = (ratingA: number, ratingB: number): number => {
	return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

export const getKFactor = (rating: number): number => {
	if (rating < 1000) return 48;
	if (rating < 1600) return 40;
	if (rating < 2000) return 32;
	return 24;
};

export const updateElo = async (
	prisma: PrismaService,
	whiteId: string,
	blackId: string,
	outcome: GameOutcome,
): Promise<EloResult | null> => {
	const game = await prisma.game.findFirst({
		where: {
			OR: [
				{ whiteId, blackId },
				{ whiteId: blackId, blackId: whiteId },
			],
		},
		orderBy: { createdAt: 'desc' },
		take: 1,
	});

	if (!game || game.mode === GameMode.AI) {
		return null;
	}

	const white = await prisma.user.findUnique({
		where: { id: whiteId },
		select: { elo: true },
	});
	const black = await prisma.user.findUnique({
		where: { id: blackId },
		select: { elo: true },
	});

	if (!white || !black) {
		return null;
	}

	const whiteRating = white.elo;
	const blackRating = black.elo;

	const expectedWhite = calculateExpected(whiteRating, blackRating);
	const expectedBlack = calculateExpected(blackRating, whiteRating);

	let whiteChange: number;
	let blackChange: number;

	const whiteK = getKFactor(whiteRating);
	const blackK = getKFactor(blackRating);

	switch (outcome) {
		case GameOutcome.WHITE_WINS:
			whiteChange = Math.round(whiteK * (1 - expectedWhite));
			blackChange = Math.round(blackK * (0 - expectedBlack));
			break;
		case GameOutcome.BLACK_WINS:
			whiteChange = Math.round(whiteK * (0 - expectedWhite));
			blackChange = Math.round(blackK * (1 - expectedBlack));
			break;
		case GameOutcome.DRAW:
			whiteChange = Math.round(whiteK * (0.5 - expectedWhite));
			blackChange = Math.round(blackK * (0.5 - expectedBlack));
			break;
	}

	const newWhiteElo = Math.max(100, whiteRating + whiteChange);
	const newBlackElo = Math.max(100, blackRating + blackChange);

	await prisma.$transaction([
		prisma.user.update({
			where: { id: whiteId },
			data: { elo: newWhiteElo },
		}),
		prisma.user.update({
			where: { id: blackId },
			data: { elo: newBlackElo },
		}),
	]);

	return {
		whiteElo: newWhiteElo,
		blackElo: newBlackElo,
		whiteChange,
		blackChange,
	};
};