import {
	BadRequestException,
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Chess } from 'chess.js';
import { GameStatus, GameMode } from '../prisma/generated/enums';
import { FinishGameDto } from './dto/finish-game.dto';
import { MakeMoveDto } from './dto/make-move.dto';

/**
 * Service handling chess game lifecycle and move validation.
 */
@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Create a new game (online or AI).
	 *
	 * @param dto Game creation parameters (mode, timeControl)
	 * @param userId Id of the user creating the game (assigned as white player)
	 * @returns The created game
	 */
	async createGame(dto: CreateGameDto, userId: string) {
		const game = await this.prisma.game.create({
			data: {
				whiteId: userId,
				blackId: null,
				status: GameStatus.WAITING,
				mode: dto.mode,
				timeControl: dto.timeControl,
			},
		});

		return game;
	}

	/**
	 * Get online games waiting for a second player.
	 *
	 * @returns List of up to 20 waiting online games, ordered by most recent
	 */
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

	/**
	 * Get all games where the user is a player.
	 *
	 * @param userId User id
	 * @returns List of games ordered by most recent
	 */
	async getUserGames(userId: string) {
		const games = await this.prisma.game.findMany({
			where: {
				OR: [{ whiteId: userId }, { blackId: userId }],
			},
			orderBy: { createdAt: 'desc' },
		});

		return games;
	}

	/**
	 * Get a game by id.
	 *
	 * @param id Game id
	 * @returns The game
	 * @throws {NotFoundException} If game not found
	 */
	async getGame(id: string) {
		const game = await this.prisma.game.findUnique({ where: { id } });

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		return game;
	}

	/**
	 * Start a waiting game.
	 * Returns the game unchanged if already ongoing.
	 *
	 * @param gameId Game id
	 * @param userId Id of the user starting the game
	 * @returns The updated game
	 * @throws {NotFoundException} If game not found
	 * @throws {BadRequestException} If game is not in WAITING status
	 * @throws {ForbiddenException} If user is not a player in this game
	 */
	async startGame(gameId: string, userId: string) {
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

		if (!game.blackId && userId !== game.whiteId) {
			const userExists = await this.prisma.user.findUnique({
				where: { id: userId },
			});
			if (!userExists) {
				throw new NotFoundException('User not found');
			}

			await this.prisma.game.update({
				where: { id: gameId },
				data: { blackId: userId },
			});

			game.blackId = userId;
		}

		if (userId !== game.whiteId && userId !== game.blackId) {
			throw new ForbiddenException('User is not a player');
		}

		return this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.ONGOING,
				currentFen: new Chess().fen(),
				pgn: '',
			},
		});
	}

	/**
	 * Finish an ongoing game.
	 *
	 * @param gameId Game id
	 * @param dto Finish game data (winnerId, currentFen, pgn)
	 * @param userId Id of the user finishing the game
	 * @returns The updated game
	 * @throws {NotFoundException} If game not found
	 * @throws {ForbiddenException} If user is not a player in this game
	 * @throws {BadRequestException} If game is not ongoing
	 */
	async finishGame(gameId: string, dto: FinishGameDto, userId: string) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			throw new ForbiddenException('You are not a player in this game');
		}

		if (game.status !== GameStatus.ONGOING) {
			throw new BadRequestException('Game is not ongoing');
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

	/**
	 * Cancel a waiting game. Only the white player can cancel the game and only if the game has not started yet.
	 *
	 * @param gameId Game id
	 * @param userId Id of the user canceling the game
	 * @returns The updated game
	 * @throws {NotFoundException} If game not found
	 * @throws {ForbiddenException} If user is not the white player in this game
	 * @throws {BadRequestException} If game is not in WAITING status
	 */
	async cancelGame(gameId: string, userId: string) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			throw new ForbiddenException('You are not a player in this game');
		}

		if (game.status !== GameStatus.WAITING) {
			throw new BadRequestException('Cannot cancel a started game');
		}

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.ABORTED,
				winnerId: null,
			},
		});

		return { ...updatedGame, endReason: 'canlled' };
	}

	/**
	 * Apply a move to an ongoing game.
	 * Automatically detects checkmate, draw, stalemate and updates game status.
	 * Uses optimistic concurrency control on currentFen to prevent race conditions.
	 *
	 * @param gameId Game id
	 * @param dto Move data (move string in UCI or SAN notation)
	 * @param userId Id of the user making the move
	 * @returns The updated game
	 * @throws {NotFoundException} If game not found
	 * @throws {BadRequestException} If game is not ongoing, not the player's turn, or move is illegal
	 */
	async makeMove(gameId: string, dto: MakeMoveDto, userId: string) {
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
		let winnerId: string | null = null;
		let endReason: string | null = null;

		if (chess.isCheckmate()) {
			status = GameStatus.FINISHED;
			winnerId = isWhiteTurn ? game.whiteId : (game.blackId ?? null);
			endReason = 'checkmate';
		} else if (chess.isStalemate()) {
			status = GameStatus.FINISHED;
			winnerId = null;
			endReason = 'stalemate';
		} else if (chess.isThreefoldRepetition()) {
			status = GameStatus.FINISHED;
			winnerId = null;
			endReason = 'repetition';
		} else if (chess.isInsufficientMaterial()) {
			status = GameStatus.FINISHED;
			winnerId = null;
			endReason = 'insufficient';
		} else if (chess.isDraw()) {
			status = GameStatus.FINISHED;
			winnerId = null;
			endReason = 'draw';
		}

		const updatedGame = await this.prisma.game.update({
			where: {
				id: gameId,
				currentFen: game.currentFen, // Optimistic concurrency control
			},
			data: {
				currentFen: chess.fen(),
				pgn: chess
					.pgn()
					.replace(/\[.*?\]\s*/g, '')
					.trim()
					.replace(/\s*\*$/, ''),
				status,
				winnerId,
			},
		});

		return { ...updatedGame, endReason };
	}

	/**
	 * Resign from an ongoing game.
	 *
	 * @param gameId Game id
	 * @param userId Id of the user resigning from the game
	 * @returns The updated game
	 * @throws {NotFoundException} If game not found
	 * @throws {BadRequestException} If game is not ongoing
	 * @throws {ForbiddenException} If user is not a player in this game
	 */
	async resignGame(gameId: string, userId: string) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});
		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.status !== GameStatus.ONGOING) {
			throw new BadRequestException('Game is not ongoing');
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			throw new ForbiddenException('You are not a player in this game');
		}

		const winnerId = game.whiteId === userId ? game.blackId : game.whiteId;

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.FINISHED,
				winnerId,
			},
		});

		return { ...updatedGame, endReason: 'resignation' as const };
	}

	/**
	 * offer a draw in an ongoing game.
	 *
	 * @param gameId Game id
	 * @param userId Id of the user offering the draw
	 * @returns The updated game
	 * @throws {NotFoundException} If game not found
	 * @throws {BadRequestException} If game is not ongoing or if there is already a draw offer
	 * @throws {ForbiddenException} If user is not a player in this game
	 */
	async offerDraw(gameId: string, userId: string) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});
		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.status !== GameStatus.ONGOING) {
			throw new BadRequestException('Game is not ongoing');
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			throw new ForbiddenException('You are not a player in this game');
		}

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: { drawOfferedBy: userId },
		});

		return updatedGame;
	}

	/**
	 * Accept a draw offer in an ongoing game.
	 *
	 * @param gameId Game id
	 * @param userId Id of the user accepting the draw offer
	 * @returns The updated game
	 * @throws {NotFoundException} If game not found
	 * @throws {BadRequestException} If game is not ongoing or if there is no draw offer to accept
	 * @throws {ForbiddenException} If user is not a player in this game
	 */
	async acceptDraw(gameId: string, userId: string) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});
		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.status !== GameStatus.ONGOING) {
			throw new BadRequestException('Game is not ongoing');
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			throw new ForbiddenException('You are not a player in this game');
		}

		if (!game.drawOfferedBy || game.drawOfferedBy === userId) {
			throw new BadRequestException('No draw offer to accept');
		}

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.FINISHED,
				winnerId: null,
			},
		});

		return { ...updatedGame, endReason: 'draw' as const };
	}

	/**
	 * Decline a draw offer in an ongoing game.
	 *
	 * @param gameId Game id
	 * @param userId Id of the user declining the draw offer
	 * @returns The updated game
	 * @throws {NotFoundException} If game not found
	 * @throws {BadRequestException} If game is not ongoing or if there is no draw offer to decline
	 * @throws {ForbiddenException} If user is not a player in this game
	 */
	async declineDraw(gameId: string, userId: string) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});
		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.status !== GameStatus.ONGOING) {
			throw new BadRequestException('Game is not ongoing');
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			throw new ForbiddenException('You are not a player in this game');
		}

		if (!game.drawOfferedBy || game.drawOfferedBy === userId) {
			throw new BadRequestException('No draw offer to refuse');
		}

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				drawOfferedBy: null,
			},
		});

		return updatedGame;
	}
}
