import { Test, TestingModule } from '@nestjs/testing';
import {
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/prisma.service.mock';
import { GameStatus, GameMode } from '../prisma/generated/enums';
import { EXAMPLES } from '../common/constants';
import { gameFixture, ongoingGameFixture } from './game.service.mock';
import { describe } from 'node:test';
import { FriendsService } from '../friends/friends.service';
import { UsersService } from '../users/users.service';
import { PresenceGateway } from '../presence/presence.gateway';

describe('GameService', () => {
	let service: GameService;
	let prismaService: PrismaService;
	let friendsService: FriendsService;
	let usersService: UsersService;
	let presenceGateway: PresenceGateway;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GameService,
				PrismaServiceMock,
				{
					provide: FriendsService,
					useValue: {
						areFriends: jest.fn().mockResolvedValue(true),
					},
				},
				{
					provide: UsersService,
					useValue: {
						findOneById: jest.fn().mockResolvedValue({
							id: EXAMPLES.id,
							username: EXAMPLES.username,
							avatarUrl: EXAMPLES.avatarUrl,
							elo: EXAMPLES.elo,
						}),
					},
				},
				{
					provide: PresenceGateway,
					useValue: {
						isUserOnline: jest.fn().mockReturnValue(true),
						emitGameInvite: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<GameService>(GameService);
		prismaService = module.get<PrismaService>(PrismaService);
		friendsService = module.get<FriendsService>(FriendsService);
		usersService = module.get<UsersService>(UsersService);
		presenceGateway = module.get<PresenceGateway>(PresenceGateway);

		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should define needed services', () => {
			expect(service).toBeDefined();
			expect(prismaService).toBeDefined();
		});
	});

	describe('createGame', () => {
		it('should create an online game', async () => {
			jest.spyOn(prismaService.game, 'create').mockResolvedValue(
				gameFixture as any,
			);

			const result = await service.createGame(
				{ timeControl: EXAMPLES.timeControl, mode: GameMode.ONLINE },
				EXAMPLES.id,
			);

			expect(prismaService.game.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						whiteId: EXAMPLES.id,
						blackId: null,
						mode: GameMode.ONLINE,
						timeControl: EXAMPLES.timeControl,
					}),
				}),
			);
			expect(result.status).toBe(GameStatus.WAITING);
			expect(result.mode).toBe(GameMode.ONLINE);
			expect(result.whiteId).toBe(EXAMPLES.id);
			expect(result.blackId).toBeNull();
		});

		it('should create an AI game with blackId null', async () => {
			const aiGameFixture = { ...gameFixture, mode: GameMode.AI };
			jest.spyOn(prismaService.game, 'create').mockResolvedValue(
				aiGameFixture as any,
			);

			const result = await service.createGame(
				{ timeControl: EXAMPLES.timeControl, mode: GameMode.AI },
				EXAMPLES.id,
			);

			expect(prismaService.game.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						mode: GameMode.AI,
						blackId: null,
					}),
				}),
			);
			expect(result.mode).toBe(GameMode.AI);
			expect(result.blackId).toBeNull();
		});
	});

	describe('createInvitedGame', () => {
		it('should reject if user invites themselves', async () => {
			await expect(
				service.createInvitedGame(
					{
						friendId: EXAMPLES.id,
						timeControl: EXAMPLES.timeControl,
					},
					EXAMPLES.id,
				),
			).rejects.toThrow(BadRequestException);
		});

		it('should create an online game and emit the invite', async () => {
			jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
				gameFixture,
			] as any);

			jest.spyOn(prismaService.game, 'delete').mockResolvedValue(
				gameFixture as any,
			);

			const result = await service.createInvitedGame(
				{
					friendId: EXAMPLES.id2,
					timeControl: EXAMPLES.timeControl,
				},
				EXAMPLES.id,
			);

			expect(friendsService.areFriends).toHaveBeenCalledWith(
				EXAMPLES.id,
				EXAMPLES.id2,
			);
			expect(usersService.findOneById).toHaveBeenCalledWith(EXAMPLES.id);
			expect(presenceGateway.emitGameInvite).toHaveBeenCalledWith(
				EXAMPLES.id2,
				expect.objectContaining({
					gameId: gameFixture.id,
					gameUrl: `/game/${gameFixture.id}`,
					timeControl: EXAMPLES.timeControl,
					inviter: expect.objectContaining({
						id: EXAMPLES.id,
						username: EXAMPLES.username,
					}),
				}),
			);
			expect(result.id).toBe(gameFixture.id);
		});

		it('should reject if inviter does not exist', async () => {
			jest.spyOn(usersService, 'findOneById').mockResolvedValue(null);

			await expect(
				service.createInvitedGame(
					{
						friendId: EXAMPLES.id2,
						timeControl: EXAMPLES.timeControl,
					},
					EXAMPLES.id,
				),
			).rejects.toThrow(NotFoundException);
		});

		it('should reject if the invited game could not be created', async () => {
			jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([] as any);

			await expect(
				service.createInvitedGame(
					{
						friendId: EXAMPLES.id2,
						timeControl: EXAMPLES.timeControl,
					},
					EXAMPLES.id,
				),
			).rejects.toThrow(BadRequestException);
		});

		it('should delete the created game if emitting the invite fails', async () => {
			const socketError = new Error('socket failure');

			jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
				gameFixture,
			] as any);
			jest.spyOn(prismaService.game, 'delete').mockResolvedValue(
				gameFixture as any,
			);
			jest.spyOn(presenceGateway, 'emitGameInvite').mockImplementation(
				() => {
					throw socketError;
				},
			);

			await expect(
				service.createInvitedGame(
					{
						friendId: EXAMPLES.id2,
						timeControl: EXAMPLES.timeControl,
					},
					EXAMPLES.id,
				),
			).rejects.toThrow(socketError);

			expect(prismaService.game.delete).toHaveBeenCalledWith({
				where: { id: gameFixture.id },
			});
		});

		it('should reject if target user is not a friend', async () => {
			jest.spyOn(friendsService, 'areFriends').mockResolvedValue(false);

			await expect(
				service.createInvitedGame(
					{
						friendId: EXAMPLES.id2,
						timeControl: EXAMPLES.timeControl,
					},
					EXAMPLES.id,
				),
			).rejects.toThrow(ForbiddenException);
		});

		it('should reject if target user is offline', async () => {
			jest.spyOn(presenceGateway, 'isUserOnline').mockReturnValue(false);

			await expect(
				service.createInvitedGame(
					{
						friendId: EXAMPLES.id2,
						timeControl: EXAMPLES.timeControl,
					},
					EXAMPLES.id,
				),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe('getGame', () => {
		it('should return a game', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				gameFixture as any,
			);

			const result = await service.getGame(EXAMPLES.gameId);

			expect(prismaService.game.findUnique).toHaveBeenCalledWith({
				where: { id: EXAMPLES.gameId },
			});
			expect(result.id).toBe(EXAMPLES.gameId);
			expect(result.status).toBe(GameStatus.WAITING);
		});

		it('should throw NotFoundException if game does not exist', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				null,
			);

			await expect(service.getGame('missing-id')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('getActiveGames', () => {
		it('should return waiting online games', async () => {
			jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
				gameFixture,
			] as any);

			const result = await service.getActiveGames();

			expect(prismaService.$queryRaw).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0].status).toBe(GameStatus.WAITING);
			expect(result[0].creatorUsername).toBe(EXAMPLES.username);
			expect(result[0].creatorElo).toBe(EXAMPLES.elo);
		});
	});

	describe('getUserGames', () => {
		it('should return games where user is white or black', async () => {
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue([
				gameFixture,
			] as any);

			const result = await service.getUserGames(EXAMPLES.id);

			expect(prismaService.game.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						OR: [
							{ whiteId: EXAMPLES.id },
							{ blackId: EXAMPLES.id },
						],
					},
				}),
			);
			expect(result).toHaveLength(1);
		});
	});

	describe('startGame', () => {
		it('should start a waiting game', async () => {
			const startedGame = {
				...gameFixture,
				blackId: EXAMPLES.id2,
				status: GameStatus.ONGOING,
				currentFen:
					'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				pgn: '',
			};
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue({
				...gameFixture,
				blackId: EXAMPLES.id2,
			} as any);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue(
				startedGame as any,
			);

			const result = await service.startGame(
				EXAMPLES.gameId,
				EXAMPLES.id,
			);

			expect(prismaService.game.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: GameStatus.ONGOING,
					}),
				}),
			);
			expect(result.status).toBe(GameStatus.ONGOING);
		});

		it('should return current game unchanged if already ongoing', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			const result = await service.startGame(
				EXAMPLES.gameId,
				EXAMPLES.id,
			);

			expect(prismaService.game.update).not.toHaveBeenCalled();
			expect(result.status).toBe(GameStatus.ONGOING);
		});

		it('should throw NotFoundException if game does not exist', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				null,
			);

			await expect(
				service.startGame('missing-id', EXAMPLES.id),
			).rejects.toThrow(NotFoundException);
		});

		it('should allow a second player to join as black and start the game', async () => {
			const waitingGame = {
				...gameFixture,
				blackId: null,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				waitingGame as any,
			);
			jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
				{ invitedUserId: null },
			] as any);

			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
				id: 'invalid-user-id',
			} as any);

			jest.spyOn(prismaService.game, 'update').mockResolvedValue({
				...gameFixture,
				blackId: 'invalid-user-id',
				status: GameStatus.ONGOING,
			} as any);

			const result = await service.startGame(
				EXAMPLES.gameId,
				'invalid-user-id',
			);

			expect(result.blackId).toBe('invalid-user-id');
			expect(result.status).toBe(GameStatus.ONGOING);
		});

		it('should reject when the game was invited for another user', async () => {
			const waitingGame = {
				...gameFixture,
				blackId: null,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				waitingGame as any,
			);
			jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
				{ invitedUserId: EXAMPLES.id2 },
			] as any);

			await expect(
				service.startGame(EXAMPLES.gameId, 'invalid-user-id'),
			).rejects.toThrow(ForbiddenException);
		});

		it('should reject if the joining second player does not exist', async () => {
			const waitingGame = {
				...gameFixture,
				blackId: null,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				waitingGame as any,
			);
			jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
				{ invitedUserId: null },
			] as any);
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				null,
			);

			await expect(
				service.startGame(EXAMPLES.gameId, 'invalid-user-id'),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw ForbiddenException if game is full and user is not a player', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue({
				...gameFixture,
				blackId: EXAMPLES.id2,
			} as any);

			await expect(
				service.startGame(EXAMPLES.gameId, 'invalid-user-id'),
			).rejects.toThrow(ForbiddenException);
		});

		it('should throw BadRequestException if game is already finished', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue({
				...gameFixture,
				status: GameStatus.FINISHED,
			} as any);

			await expect(
				service.startGame(EXAMPLES.gameId, EXAMPLES.id),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe('finishGame', () => {
		const finishDto = {
			winnerId: EXAMPLES.id,
			currentFen: 'some-fen',
			pgn: '1. e4',
		};
		const finishGame = () =>
			service.finishGame(EXAMPLES.gameId, finishDto, EXAMPLES.id2);

		it('should finish a game and persist the result', async () => {
			const finishedGame = {
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
				winnerId: EXAMPLES.id,
			};
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue(
				finishedGame as any,
			);

			const result = await finishGame();

			expect(prismaService.game.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: GameStatus.FINISHED,
						winnerId: EXAMPLES.id,
					}),
				}),
			);
			expect(result.status).toBe(GameStatus.FINISHED);
			expect(result.winnerId).toBe(EXAMPLES.id);
		});

		it('should throw BadRequestException if game is already finished', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue({
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
			} as any);

			await expect(finishGame()).rejects.toThrow(BadRequestException);
		});

		it('should throw ForbiddenException if user is not a player', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(
				service.finishGame(
					EXAMPLES.gameId,
					finishDto,
					'invalid-user-id',
				),
			).rejects.toThrow(ForbiddenException);
		});
	});

	describe('makeMove', () => {
		it('should apply a legal move and return updated game', async () => {
			const updatedGame = {
				...ongoingGameFixture,
				currentFen: 'new-fen',
				pgn: '1. e4',
			};
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue(
				updatedGame as any,
			);

			const result = await service.makeMove(
				EXAMPLES.gameId,
				{ move: { from: 'e2', to: 'e4' } },
				EXAMPLES.id,
			);

			expect(prismaService.game.update).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should throw NotFoundException if game does not exist', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				null,
			);

			await expect(
				service.makeMove(
					'missing-id',
					{ move: { from: 'e2', to: 'e4' } },
					EXAMPLES.id,
				),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException if game is not ongoing', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				gameFixture as any,
			);

			await expect(
				service.makeMove(
					EXAMPLES.gameId,
					{ move: { from: 'e2', to: 'e4' } },
					EXAMPLES.id,
				),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException if it is not the player turn', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(
				service.makeMove(EXAMPLES.gameId, { move: 'e4' }, EXAMPLES.id2),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException on illegal move', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(
				service.makeMove(
					EXAMPLES.gameId,
					{ move: { from: 'e9', to: 'e4' } },
					EXAMPLES.id,
				),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe('resignGame', () => {
		const resignGame = () =>
			service.resignGame(EXAMPLES.gameId, EXAMPLES.id);

		it('should resign and set opponent as winner', async () => {
			const updatedGame = {
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
				winnerId: EXAMPLES.id2,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue(
				updatedGame as any,
			);

			const result = await resignGame();

			expect(prismaService.game.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: GameStatus.FINISHED,
						winnerId: EXAMPLES.id2,
					}),
				}),
			);
			expect(result.winnerId).toBe(EXAMPLES.id2);
		});

		it('should throw NotFoundException if game does not exist', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				null,
			);

			await expect(resignGame()).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException if game is not ongoing', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue({
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
			} as any);

			await expect(resignGame()).rejects.toThrow(BadRequestException);
		});

		it('should throw ForbiddenException if user is not a player', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(
				service.resignGame(EXAMPLES.gameId, 'invalid-user'),
			).rejects.toThrow(ForbiddenException);
		});
	});

	describe('offerDraw', () => {
		const offerDraw = () => service.offerDraw(EXAMPLES.gameId, EXAMPLES.id);

		it('should set drawOfferedBy', async () => {
			const updatedGame = {
				...ongoingGameFixture,
				drawOfferedBy: EXAMPLES.id,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue(
				updatedGame as any,
			);

			const result = await offerDraw();

			expect(prismaService.game.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { drawOfferedBy: EXAMPLES.id },
				}),
			);
			expect(result.drawOfferedBy).toBe(EXAMPLES.id);
		});

		it('should throw NotFoundException if game not found', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				null,
			);

			await expect(offerDraw()).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException if game is not ongoing', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue({
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
			} as any);

			await expect(offerDraw()).rejects.toThrow(BadRequestException);
		});

		it('should throw ForbiddenException if user is not a player', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(
				service.offerDraw(EXAMPLES.gameId, 'invalid-user'),
			).rejects.toThrow(ForbiddenException);
		});
	});

	describe('acceptDraw', () => {
		const acceptDraw = () =>
			service.acceptDraw(EXAMPLES.gameId, EXAMPLES.id2);

		it('should finish game with no winner', async () => {
			const gameWithOffer = {
				...ongoingGameFixture,
				drawOfferedBy: EXAMPLES.id,
			};

			const updatedGame = {
				...gameWithOffer,
				status: GameStatus.FINISHED,
				winnerId: null,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				gameWithOffer as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue(
				updatedGame as any,
			);

			const result = await acceptDraw();

			expect(result.status).toBe(GameStatus.FINISHED);
			expect(result.winnerId).toBeNull();
		});

		it('should throw if no draw offer', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(acceptDraw()).rejects.toThrow(BadRequestException);
		});

		it('should throw if same user tries to accept own offer', async () => {
			const gameWithOffer = {
				...ongoingGameFixture,
				drawOfferedBy: EXAMPLES.id,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				gameWithOffer as any,
			);

			await expect(
				service.acceptDraw(EXAMPLES.gameId, EXAMPLES.id),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe('declineDraw', () => {
		const declineDraw = () =>
			service.declineDraw(EXAMPLES.gameId, EXAMPLES.id2);

		it('should remove draw offer', async () => {
			const gameWithOffer = {
				...ongoingGameFixture,
				drawOfferedBy: EXAMPLES.id,
			};

			const updatedGame = {
				...gameWithOffer,
				drawOfferedBy: null,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				gameWithOffer as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue(
				updatedGame as any,
			);

			const result = await declineDraw();

			expect(result.drawOfferedBy).toBeNull();
		});

		it('should throw if no draw offer', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(declineDraw()).rejects.toThrow(BadRequestException);
		});

		it('should throw if user declines own offer', async () => {
			const gameWithOffer = {
				...ongoingGameFixture,
				drawOfferedBy: EXAMPLES.id,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				gameWithOffer as any,
			);

			await expect(
				service.declineDraw(EXAMPLES.gameId, EXAMPLES.id),
			).rejects.toThrow(BadRequestException);
		});
	});
	describe('cancelGame', () => {
		it('should cancel a waiting game', async () => {
			const waitingGame = {
				...gameFixture,
				status: GameStatus.WAITING,
				whiteId: EXAMPLES.id,
				blackId: null,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				waitingGame as any,
			);

			jest.spyOn(prismaService.game, 'update').mockResolvedValue({
				...waitingGame,
				status: GameStatus.ABORTED,
				winnerId: null,
			} as any);

			const result = await service.cancelGame(
				waitingGame.id,
				EXAMPLES.id,
			);

			expect(prismaService.game.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: waitingGame.id },
					data: expect.objectContaining({
						status: GameStatus.ABORTED,
						winnerId: null,
					}),
				}),
			);

			expect(result.status).toBe(GameStatus.ABORTED);
			expect(result.winnerId).toBeNull();
		});

		it('should throw if game not found', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				null,
			);

			await expect(
				service.cancelGame('invalid-id', EXAMPLES.id),
			).rejects.toThrow('Game not found');
		});

		it('should throw if user is not a player', async () => {
			const game = {
				...gameFixture,
				status: GameStatus.WAITING,
				whiteId: 'other-user',
				blackId: null,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				game as any,
			);

			await expect(
				service.cancelGame(game.id, EXAMPLES.id),
			).rejects.toThrow('You are not a player in this game');
		});

		it('should throw if game is not waiting', async () => {
			const ongoingGame = {
				...gameFixture,
				status: GameStatus.ONGOING,
				whiteId: EXAMPLES.id,
				blackId: 'opponent-id',
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGame as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue({
				...ongoingGame,
				status: GameStatus.FINISHED,
				winnerId: 'opponent-id',
			} as any);

			const result = await service.cancelGame(ongoingGame.id, EXAMPLES.id);

			expect(prismaService.game.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: ongoingGame.id },
					data: expect.objectContaining({
						status: GameStatus.FINISHED,
						winnerId: 'opponent-id',
					}),
				}),
			);
			expect(result.status).toBe(GameStatus.FINISHED);
			expect(result.winnerId).toBe('opponent-id');
		});
	});

	describe('handlePlayerDisconnect', () => {
		it('should abort a waiting game when a player disconnects', async () => {
			const waitingGame = {
				...gameFixture,
				status: GameStatus.WAITING,
				whiteId: EXAMPLES.id,
				blackId: null,
			};

			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				waitingGame as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue({
				...waitingGame,
				status: GameStatus.ABORTED,
				winnerId: null,
			} as any);

			const result = await service.handlePlayerDisconnect(
				waitingGame.id,
				EXAMPLES.id,
			);

			expect(result?.status).toBe(GameStatus.ABORTED);
			expect(result?.winnerId).toBeNull();
			expect(result?.endReason).toBe('cancelled');
		});

		it('should award the opponent on ongoing disconnect', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);
			jest.spyOn(prismaService.game, 'update').mockResolvedValue({
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
				winnerId: EXAMPLES.id2,
			} as any);

			const result = await service.handlePlayerDisconnect(
				ongoingGameFixture.id,
				EXAMPLES.id,
			);

			expect(result?.status).toBe(GameStatus.FINISHED);
			expect(result?.winnerId).toBe(EXAMPLES.id2);
			expect(result?.endReason).toBe('disconnect');
		});

		it('should return null when the game is already finished', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue({
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
			} as any);

			const result = await service.handlePlayerDisconnect(
				ongoingGameFixture.id,
				EXAMPLES.id,
			);

			expect(result).toBeNull();
			expect(prismaService.game.update).not.toHaveBeenCalled();
		});
	});
});
