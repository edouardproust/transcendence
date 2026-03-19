import {
	BadRequestException,
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
	CreateGameDto,
	MakeMoveDto,
	FinishGameDto,
} from './dto/create-game.dto';
import { Chess } from 'chess.js';
import { GameStatus, GameMode } from '../prisma/generated/enums';

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	// ------------------------------------------------------------------ //
	// POST /games
	// ------------------------------------------------------------------ //
	async createGame(dto: CreateGameDto, userId: number) {
		const mode = dto.mode === 'ai' ? GameMode.AI : GameMode.ONLINE;

		const game = await this.prisma.game.create({
			data: {
				whiteId: userId,
				blackId: null,
				status: GameStatus.WAITING,
				mode,
				timeControl: dto.timeControl,
			},
		});

		return game;
	}

	// ------------------------------------------------------------------ //
	// GET /games/active  — parties en attente rejoignables (lobby)
	// ------------------------------------------------------------------ //
	async getActiveGames() {
		const games = await this.prisma.game.findMany({
			where: {
				status: GameStatus.WAITING,
				mode: GameMode.ONLINE,
				blackId: null,
			},
			orderBy: { createdAt: 'desc' },
			take: 20,
		});

		return games;
	}

	// ------------------------------------------------------------------ //
	// GET /games/user
	// ------------------------------------------------------------------ //
	async getUserGames(userId: number) {
		const games = await this.prisma.game.findMany({
			where: {
				OR: [{ whiteId: userId }, { blackId: userId }],
			},
			orderBy: { createdAt: 'desc' },
		});

		return games;
	}

	// ------------------------------------------------------------------ //
	// GET /games/:id
	// ------------------------------------------------------------------ //
	async getGame(id: string) {
		const game = await this.prisma.game.findUnique({ where: { id } });

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		return game;
	}

	// ------------------------------------------------------------------ //
	// POST /games/:id/start
	// ------------------------------------------------------------------ //
	async startGame(gameId: string, userId: number) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.status === GameStatus.ONGOING) {
			return game;
		}

		if (game.status !== GameStatus.WAITING) {
			throw new BadRequestException('Game cannot be started');
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			throw new ForbiddenException('You are not a player in this game');
		}

		const chess = new Chess();

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.ONGOING,
				currentFen: chess.fen(),
				pgn: '',
			},
		});

		return updatedGame;
	}

	// ------------------------------------------------------------------ //
	// POST /games/:id/finish
	// ------------------------------------------------------------------ //
	async finishGame(gameId: string, dto: FinishGameDto, userId: number) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			throw new ForbiddenException('You are not a player in this game');
		}

		if (game.status === GameStatus.FINISHED) {
			return game;
		}

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.FINISHED,
				winnerId: dto.winnerId ?? null,
				currentFen: dto.currentFen,
				pgn: dto.pgn,
			},
		});

		return updatedGame;
	}

	// ------------------------------------------------------------------ //
	// POST /games/:id/move
	// ------------------------------------------------------------------ //
	async makeMove(gameId: string, dto: MakeMoveDto, userId: number) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.status !== GameStatus.ONGOING) {
			throw new BadRequestException('Game is not ongoing');
		}

		const chess = new Chess();

		if (game.pgn) {
			chess.loadPgn(game.pgn);
		} else if (game.currentFen) {
			chess.load(game.currentFen);
		}

		const isWhiteTurn = chess.turn() === 'w';
		const expectedPlayerId = isWhiteTurn ? game.whiteId : game.blackId;

		if (userId !== expectedPlayerId) {
			throw new BadRequestException('Not your turn');
		}

		let move;
		try {
			move = chess.move(dto.move);
		} catch {
			throw new BadRequestException('Illegal move');
		}

		if (!move) {
			throw new BadRequestException('Illegal move');
		}

		let status: GameStatus = GameStatus.ONGOING;
		let winnerId: number | null = null;

		if (chess.isCheckmate()) {
			status = GameStatus.FINISHED;
			winnerId = isWhiteTurn ? game.whiteId : (game.blackId ?? null);
		} else if (
			chess.isDraw() ||
			chess.isStalemate() ||
			chess.isThreefoldRepetition() ||
			chess.isInsufficientMaterial()
		) {
			status = GameStatus.FINISHED;
			winnerId = null;
		}

		const updatedGame = await this.prisma.game.update({
			where: {
				id: gameId,
				currentFen: game.currentFen, // Optimistic concurrency control
			},
			data: {
				currentFen: chess.fen(),
				pgn: chess.pgn(),
				status,
				winnerId,
			},
		});

		return updatedGame;
	}
}
