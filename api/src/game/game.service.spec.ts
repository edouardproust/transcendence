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

const GAME_ID = '11111111-1111-1111-1111-111111111111';

// Partie en base (format Prisma, avant sérialisation)
const dbGameFixture = {
	id: GAME_ID,
	status: GameStatus.WAITING,
	mode: GameMode.ONLINE,
	whiteId: 1,
	blackId: null,
	winnerId: null,
	currentFen: null,
	pgn: null,
	timeControl: '10+0',
	createdAt: new Date('2024-01-01T00:00:00.000Z'),
	updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

const ongoingGameFixture = {
	...dbGameFixture,
	status: GameStatus.ONGOING,
	blackId: 2,
	currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
	pgn: '',
};

describe('GameService', () => {
	let service: GameService;
	let prisma: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [GameService, PrismaServiceMock],
		}).compile();

		service = module.get<GameService>(GameService);
		prisma = module.get<PrismaService>(PrismaService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	// ------------------------------------------------------------------ //
	// createGame
	// ------------------------------------------------------------------ //
	describe('createGame', () => {
		it('should create an online game and return serialized game', async () => {
			(prisma.game.create as jest.Mock).mockResolvedValue(dbGameFixture);

			const result = await service.createGame(
				{ timeControl: '10+0', mode: 'online' },
				1,
			);

			expect(prisma.game.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						whiteId: 1,
						blackId: null,
						mode: GameMode.ONLINE,
						timeControl: '10+0',
					}),
				}),
			);
			expect(result.status).toBe('WAITING');
			expect(result.mode).toBe('ONLINE');
			expect(result.whiteId).toBe(1);
			expect(result.blackId).toBeNull();
		});

		it('should create an AI game with blackId null', async () => {
			const aiGameFixture = {
				...dbGameFixture,
				mode: GameMode.AI,
				blackId: null,
			};
			(prisma.game.create as jest.Mock).mockResolvedValue(aiGameFixture);

			const result = await service.createGame(
				{ timeControl: 'unlimited', mode: 'ai' },
				1,
			);

			expect(prisma.game.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						whiteId: 1,
						blackId: null,
						mode: GameMode.AI,
					}),
				}),
			);
			expect(result.mode).toBe('AI');
			expect(result.blackId).toBeNull();
		});
	});

	// ------------------------------------------------------------------ //
	// getGame
	// ------------------------------------------------------------------ //
	describe('getGame', () => {
		it('should return a serialized game', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				dbGameFixture,
			);

			const result = await service.getGame(GAME_ID);

			expect(result.id).toBe(GAME_ID);
			expect(result.status).toBe('WAITING');
		});

		it('should throw NotFoundException if game does not exist', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(service.getGame('missing-game-id')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	// ------------------------------------------------------------------ //
	// getActiveGames
	// ------------------------------------------------------------------ //
	describe('getActiveGames', () => {
		it('should return a list of serialized waiting online games', async () => {
			(prisma.game.findMany as jest.Mock).mockResolvedValue([
				dbGameFixture,
			]);

			const result = await service.getActiveGames();

			expect(prisma.game.findMany).toHaveBeenCalledWith(
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
			expect(result[0].status).toBe('WAITING');
		});
	});

	// ------------------------------------------------------------------ //
	// getUserGames
	// ------------------------------------------------------------------ //
	describe('getUserGames', () => {
		it('should return games where user is white or black', async () => {
			(prisma.game.findMany as jest.Mock).mockResolvedValue([
				dbGameFixture,
			]);

			const result = await service.getUserGames(1);

			expect(prisma.game.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { OR: [{ whiteId: 1 }, { blackId: 1 }] },
				}),
			);
			expect(result).toHaveLength(1);
		});
	});

	// ------------------------------------------------------------------ //
	// startGame
	// ------------------------------------------------------------------ //
	describe('startGame', () => {
		it('should start a waiting game', async () => {
			const startedGame = {
				...dbGameFixture,
				blackId: 2,
				status: GameStatus.ONGOING,
				currentFen:
					'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				pgn: '',
			};
			(prisma.game.findUnique as jest.Mock).mockResolvedValue({
				...dbGameFixture,
				blackId: 2,
			});
			(prisma.game.update as jest.Mock).mockResolvedValue(startedGame);

			const result = await service.startGame(GAME_ID, 1);

			expect(prisma.game.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: GameStatus.ONGOING,
					}),
				}),
			);
			expect(result.status).toBe('ONGOING');
		});

		it('should return current game unchanged if already ongoing', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				ongoingGameFixture,
			);

			const result = await service.startGame(GAME_ID, 1);

			expect(prisma.game.update).not.toHaveBeenCalled();
			expect(result.status).toBe('ONGOING');
		});

		it('should throw NotFoundException if game does not exist', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(
				service.startGame('missing-game-id', 1),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw ForbiddenException if user is not a player', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				dbGameFixture,
			);

			await expect(service.startGame(GAME_ID, 42)).rejects.toThrow(
				ForbiddenException,
			);
		});

		it('should throw BadRequestException if game is already finished', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue({
				...dbGameFixture,
				status: GameStatus.FINISHED,
			});

			await expect(service.startGame(GAME_ID, 1)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	// ------------------------------------------------------------------ //
	// finishGame
	// ------------------------------------------------------------------ //
	describe('finishGame', () => {
		it('should finish a game and persist the result', async () => {
			const finishedGame = {
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
				winnerId: 1,
			};
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				ongoingGameFixture,
			);
			(prisma.game.update as jest.Mock).mockResolvedValue(finishedGame);

			const result = await service.finishGame(
				GAME_ID,
				{ winnerId: 1, currentFen: 'some-fen', pgn: '1. e4' },
				1,
			);

			expect(prisma.game.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						status: GameStatus.FINISHED,
						winnerId: 1,
					}),
				}),
			);
			expect(result.status).toBe('FINISHED');
			expect(result.winnerId).toBe(1);
		});

		it('should return game unchanged if already finished', async () => {
			const finishedGame = {
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
			};
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				finishedGame,
			);

			await service.finishGame(
				GAME_ID,
				{ winnerId: null, currentFen: 'fen', pgn: '' },
				1,
			);

			expect(prisma.game.update).not.toHaveBeenCalled();
		});

		it('should throw ForbiddenException if user is not a player', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				ongoingGameFixture,
			);

			await expect(
				service.finishGame(
					GAME_ID,
					{ winnerId: null, currentFen: 'fen', pgn: '' },
					42,
				),
			).rejects.toThrow(ForbiddenException);
		});
	});

	// ------------------------------------------------------------------ //
	// makeMove
	// ------------------------------------------------------------------ //
	describe('makeMove', () => {
		it('should apply a legal move and return updated game', async () => {
			const updatedGame = {
				...ongoingGameFixture,
				currentFen: 'new-fen',
				pgn: '1. e4',
			};
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				ongoingGameFixture,
			);
			(prisma.game.update as jest.Mock).mockResolvedValue(updatedGame);

			const result = await service.makeMove(GAME_ID, { move: 'e4' }, 1);

			expect(prisma.game.update).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should throw NotFoundException if game does not exist', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(
				service.makeMove('missing-game-id', { move: 'e4' }, 1),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException if game is not ongoing', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				dbGameFixture,
			); // WAITING

			await expect(
				service.makeMove(GAME_ID, { move: 'e4' }, 1),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException if it is not the player turn', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				ongoingGameFixture,
			); // white turn

			await expect(
				service.makeMove(GAME_ID, { move: 'e4' }, 2),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException on illegal move', async () => {
			(prisma.game.findUnique as jest.Mock).mockResolvedValue(
				ongoingGameFixture,
			);

			await expect(
				service.makeMove(GAME_ID, { move: 'e9' }, 1),
			).rejects.toThrow(BadRequestException);
		});
	});
});
