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

describe('GameService', () => {
	let service: GameService;
	let prismaService: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [GameService, PrismaServiceMock],
		}).compile();

		service = module.get<GameService>(GameService);
		prismaService = module.get<PrismaService>(PrismaService);

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
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue([
				gameFixture,
			] as any);

			const result = await service.getActiveGames();

			expect(prismaService.game.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						status: GameStatus.WAITING,
						mode: GameMode.ONLINE,
						blackId: null,
					},
					take: 20,
				}),
			);
			expect(result).toHaveLength(1);
			expect(result[0].status).toBe(GameStatus.WAITING);
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
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				gameFixture as any,
			);

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
				{ move: 'e4' },
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
				service.makeMove('missing-id', { move: 'e4' }, EXAMPLES.id),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException if game is not ongoing', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				gameFixture as any,
			);

			await expect(
				service.makeMove(EXAMPLES.gameId, { move: 'e4' }, EXAMPLES.id),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException if it is not the player turn', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(
				service.makeMove(EXAMPLES.gameId, { move: 'e4' }, EXAMPLES.id2), // black player, but white's turn
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException on illegal move', async () => {
			jest.spyOn(prismaService.game, 'findUnique').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await expect(
				service.makeMove(EXAMPLES.gameId, { move: 'e9' }, EXAMPLES.id),
			).rejects.toThrow(BadRequestException);
		});
	});
});
