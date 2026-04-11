import {
	BadRequestException,
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Chess } from 'chess.js';
import { GameStatus, GameMode } from '../prisma/generated/enums';
import { FinishGameDto } from './dto/finish-game.dto';
import { MakeMoveDto } from './dto/make-move.dto';
import { getInitialTimeLeft } from './utils/time-control.utils';
import { updateElo, GameOutcome } from './utils/elo.utils';
import { CreateInvitedGameDto } from './dto/create-invited-game.dto';
import { FriendsService } from '../friends/friends.service';
import { UsersService } from '../users/users.service';
import { PresenceGateway } from '../presence/presence.gateway';

/**
 * Service handling chess game lifecycle and move validation.
 */
@Injectable()
export class GameService {
	constructor(
		private prisma: PrismaService,
		private readonly friendsService: FriendsService,
		private readonly usersService: UsersService,
		private readonly presenceGateway: PresenceGateway,
	) {}

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

	async createInvitedGame(dto: CreateInvitedGameDto, inviterId: string) {
		if (dto.friendId === inviterId) {
			throw new BadRequestException('No puedes invitarte a ti mismo');
		}

		const areFriends = await this.friendsService.areFriends(
			inviterId,
			dto.friendId,
		);
		if (!areFriends) {
			throw new ForbiddenException(
				'Solo puedes invitar a usuarios que ya son tus amigos',
			);
		}

		if (!this.presenceGateway.isUserOnline(dto.friendId)) {
			throw new BadRequestException(
				'Tu amigo debe estar en linea para recibir la invitacion',
			);
		}

		const inviter = await this.usersService.findOneById(inviterId);
		if (!inviter) {
			throw new NotFoundException('User not found');
		}

		const gameId = randomUUID();
		const now = new Date();

		const [game] = await this.prisma.$queryRaw<
			Array<{
				id: string;
				status: GameStatus;
				mode: GameMode;
				whiteId: string | null;
				blackId: string | null;
				winnerId: string | null;
				drawOfferedBy: string | null;
				currentFen: string;
				pgn: string;
				timeControl: string;
				whiteTimeLeft: number | null;
				blackTimeLeft: number | null;
				createdAt: Date;
				updatedAt: Date;
			}>
		>`
			INSERT INTO "games" (
				"id",
				"whiteId",
				"blackId",
				"invitedUserId",
				"status",
				"mode",
				"timeControl",
				"updatedAt"
			)
			VALUES (
				${gameId},
				${inviterId},
				NULL,
				${dto.friendId},
				${GameStatus.WAITING},
				${GameMode.ONLINE},
				${dto.timeControl},
				${now}
			)
			RETURNING
				"id",
				"status",
				"mode",
				"whiteId",
				"blackId",
				"winnerId",
				"drawOfferedBy",
				"currentFen",
				"pgn",
				"timeControl",
				"whiteTimeLeft",
				"blackTimeLeft",
				"createdAt",
				"updatedAt"
		`;

		if (!game) {
			throw new BadRequestException('No se pudo crear la invitacion');
		}

		try {
			this.presenceGateway.emitGameInvite(dto.friendId, {
				gameId: game.id,
				gameUrl: `/game/${game.id}`,
				timeControl: game.timeControl,
				createdAt: game.createdAt.toISOString(),
				inviter: {
					id: inviter.id,
					username: inviter.username,
					avatarUrl: inviter.avatarUrl ?? null,
					elo: inviter.elo,
				},
			});
		} catch (error) {
			await this.prisma.game
				.delete({
					where: { id: game.id },
				})
				.catch(() => undefined);
			throw error;
		}

		return game;
	}

	/**
	 * Get online games waiting for a second player.
	 *
	 * @returns List of up to 20 waiting online games, ordered by most recent
	 */
	async getActiveGames() {
		return this.prisma.$queryRaw<
			Array<{
				id: string;
				status: GameStatus;
				mode: GameMode;
				whiteId: string | null;
				blackId: string | null;
				winnerId: string | null;
				drawOfferedBy: string | null;
				currentFen: string;
				pgn: string;
				timeControl: string;
				whiteTimeLeft: number | null;
				blackTimeLeft: number | null;
				createdAt: Date;
				updatedAt: Date;
				creatorUsername: string | null;
				creatorElo: number | null;
			}>
		>`
			SELECT
				g."id",
				g."status",
				g."mode",
				g."whiteId",
				g."blackId",
				g."winnerId",
				g."drawOfferedBy",
				g."currentFen",
				g."pgn",
				g."timeControl",
				g."whiteTimeLeft",
				g."blackTimeLeft",
				g."createdAt",
				g."updatedAt",
				u."username" AS "creatorUsername",
				u."elo" AS "creatorElo"
			FROM "games" g
			LEFT JOIN "users" u ON u."id" = g."whiteId"
			WHERE
				g."status" = ${GameStatus.WAITING}
				AND g."mode" = ${GameMode.ONLINE}
				AND g."blackId" IS NULL
				AND g."invitedUserId" IS NULL
			ORDER BY g."createdAt" DESC
			LIMIT 20
		`;
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
	async startGame(
		gameId: string,
		userId: string,
		options?: { playerColor?: 'white' | 'black' },
	) {
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

		if (game.mode === GameMode.AI) {
			if (userId !== game.whiteId && userId !== game.blackId) {
				throw new ForbiddenException('User is not a player');
			}

			const preferredColor =
				options?.playerColor === 'black' ||
				(!options?.playerColor && game.blackId === userId && !game.whiteId)
					? 'black'
					: 'white';

			return this.prisma.game.update({
				where: { id: gameId },
				data: {
					status: GameStatus.ONGOING,
					whiteId: preferredColor === 'white' ? userId : null,
					blackId: preferredColor === 'black' ? userId : null,
					currentFen: new Chess().fen(),
					pgn: '',
					drawOfferedBy: null,
				},
			});
		}

		if (!game.blackId && userId !== game.whiteId) {
			const [inviteRow] = await this.prisma.$queryRaw<
				Array<{ invitedUserId: string | null }>
			>`
				SELECT "invitedUserId"
				FROM "games"
				WHERE "id" = ${gameId}
				LIMIT 1
			`;

			if (inviteRow?.invitedUserId && inviteRow.invitedUserId !== userId) {
				throw new ForbiddenException(
					'Esta partida fue creada para otro jugador invitado',
				);
			}

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
				drawOfferedBy: null,
				...(() => {
					const initialTimes = getInitialTimeLeft(game.timeControl);
					if (initialTimes) {
						return {
							whiteTimeLeft: initialTimes.white,
							blackTimeLeft: initialTimes.black,
						};
					}
					return {};
				})(),
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

		const outcome = dto.winnerId === game.whiteId
			? GameOutcome.WHITE_WINS
			: dto.winnerId === game.blackId
				? GameOutcome.BLACK_WINS
				: GameOutcome.DRAW;
		await updateElo(this.prisma, game.whiteId!, game.blackId!, outcome);

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

		if (game.status === GameStatus.WAITING) {
			const updatedGame = await this.prisma.game.update({
				where: { id: gameId },
				data: {
					status: GameStatus.ABORTED,
					winnerId: null,
					drawOfferedBy: null,
				},
			});

			return { ...updatedGame, endReason: 'cancelled' as const };
		}

		if (game.status !== GameStatus.ONGOING) {
			throw new BadRequestException('Game cannot be cancelled');
		}

		const winnerId = game.whiteId === userId ? game.blackId : game.whiteId;

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.FINISHED,
				winnerId,
				drawOfferedBy: null,
			},
		});

		return { ...updatedGame, endReason: 'resignation' as const };
	}

	async declineInvite(gameId: string, userId: string) {
		const [game] = await this.prisma.$queryRaw<
			Array<{
				id: string;
				status: GameStatus;
				invitedUserId: string | null;
			}>
		>`
			SELECT "id", "status", "invitedUserId"
			FROM "games"
			WHERE "id" = ${gameId}
			LIMIT 1
		`;

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.status !== GameStatus.WAITING) {
			throw new BadRequestException('Invite can no longer be declined');
		}

		if (game.invitedUserId !== userId) {
			throw new ForbiddenException('You are not the invited user');
		}

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.ABORTED,
				winnerId: null,
				drawOfferedBy: null,
			},
		});

		return { ...updatedGame, endReason: 'invite_declined' as const };
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

		if (status === GameStatus.FINISHED && game.whiteId && game.blackId) {
			const outcome = winnerId === game.whiteId
				? GameOutcome.WHITE_WINS
				: winnerId === game.blackId
					? GameOutcome.BLACK_WINS
					: GameOutcome.DRAW;
			await updateElo(this.prisma, game.whiteId, game.blackId, outcome);
		}

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

		if (game.whiteId && game.blackId) {
			const outcome = winnerId === game.whiteId
				? GameOutcome.WHITE_WINS
				: GameOutcome.BLACK_WINS;
			await updateElo(this.prisma, game.whiteId, game.blackId, outcome);
		}

		return { ...updatedGame, endReason: 'resignation' as const };
	}

	/**
	 * Resolve a game when a player disconnects.
	 * Waiting games are aborted, ongoing games are awarded to the remaining player.
	 *
	 * @param gameId Game id
	 * @param userId Id of the disconnected user
	 * @returns The updated game, or null if nothing had to be resolved
	 */
	async handlePlayerDisconnect(gameId: string, userId: string) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});
		if (!game) {
			return null;
		}

		if (game.whiteId !== userId && game.blackId !== userId) {
			return null;
		}

		if (game.status === GameStatus.WAITING) {
			const updatedGame = await this.prisma.game.update({
				where: { id: gameId },
				data: {
					status: GameStatus.ABORTED,
					winnerId: null,
					drawOfferedBy: null,
				},
			});

			return { ...updatedGame, endReason: 'cancelled' as const };
		}

		if (game.status !== GameStatus.ONGOING) {
			return null;
		}

		const winnerId = game.whiteId === userId ? game.blackId : game.whiteId;

		const updatedGame = await this.prisma.game.update({
			where: { id: gameId },
			data: {
				status: GameStatus.FINISHED,
				winnerId,
				drawOfferedBy: null,
			},
		});

		if (game.whiteId && game.blackId) {
			const outcome = winnerId === game.whiteId
				? GameOutcome.WHITE_WINS
				: GameOutcome.BLACK_WINS;
			await updateElo(this.prisma, game.whiteId, game.blackId, outcome);
		}

		return { ...updatedGame, endReason: 'disconnect' as const };
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

		if (game.whiteId && game.blackId) {
			await updateElo(this.prisma, game.whiteId, game.blackId, GameOutcome.DRAW);
		}

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

	async decrementTime(gameId: string, turn: 'w' | 'b', seconds: number) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});

		if (!game || game.status !== GameStatus.ONGOING) {
			return game;
		}

		const updates: Record<string, number> = {};
		if (turn === 'w' && game.whiteTimeLeft) {
			updates.whiteTimeLeft = Math.max(0, game.whiteTimeLeft - seconds);
		} else if (turn === 'b' && game.blackTimeLeft) {
			updates.blackTimeLeft = Math.max(0, game.blackTimeLeft - seconds);
		}

		if (Object.keys(updates).length === 0) {
			return game;
		}

		return this.prisma.game.update({
			where: { id: gameId },
			data: updates,
		});
	}
}
