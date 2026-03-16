import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { GameStatus } from '../prisma/generated/enums';

const mockPrismaService = {
	user: {
		findUnique: jest.fn(),
	},
	game: {
		create: jest.fn(),
		findUnique: jest.fn(),
		update: jest.fn(),
	},
};

describe('GameService', () => {
	let service: GameService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GameService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		service = module.get<GameService>(GameService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should call prisma with correct data', async () => {
		mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
		mockPrismaService.game.create.mockResolvedValue({
			id: 1,
			whiteId: 1,
			blackId: 2,
		});

		await service.createGame({ whiteId: 1, blackId: 2 });

		expect(mockPrismaService.game.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				whiteId: 1,
				blackId: 2,
				status: GameStatus.ONGOING,
			}),
		});
	});

	it('should return the created game', async () => {
		const mockGame = {
			id: 1,
			whiteId: 1,
			blackId: 2,
			status: GameStatus.ONGOING,
			currentFEN:
				'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			movesPGN: '',
			createdAt: new Date(),
		};

		mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
		mockPrismaService.game.create.mockResolvedValue(mockGame);

		const result = await service.createGame({ whiteId: 1, blackId: 2 });

		expect(result).toEqual(mockGame);
	});

	it('should throw if players are the same', async () => {
		await expect(
			service.createGame({ whiteId: 1, blackId: 1 }),
		).rejects.toThrow(BadRequestException);
	});

	it('should throw if player not found', async () => {
		mockPrismaService.user.findUnique.mockResolvedValue(null);

		await expect(
			service.createGame({ whiteId: 1, blackId: 2 }),
		).rejects.toThrow(NotFoundException);
	});

	const ongoingGame = {
		id: 1,
		whiteId: 1,
		blackId: 2,
		status: GameStatus.ONGOING,
		currentFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		movesPGN: '',
	};

	describe('makeMove', () => {
		it('should throw NotFoundException if game not found', async () => {
			mockPrismaService.game.findUnique.mockResolvedValue(null);

			await expect(
				service.makeMove(1, { move: 'e4' }, 1),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException if game is not ongoing', async () => {
			mockPrismaService.game.findUnique.mockResolvedValue({
				...ongoingGame,
				status: GameStatus.FINISHED,
			});

			await expect(
				service.makeMove(1, { move: 'e4' }, 1),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException if not the player turn', async () => {
			mockPrismaService.game.findUnique.mockResolvedValue(ongoingGame);

			await expect(
				service.makeMove(1, { move: 'e4' }, 2),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException on illegal move', async () => {
			mockPrismaService.game.findUnique.mockResolvedValue(ongoingGame);

			await expect(
				service.makeMove(1, { move: 'e9' }, 1),
			).rejects.toThrow(BadRequestException);
		});

		it('should update and return the game after a valid move', async () => {
			mockPrismaService.game.findUnique.mockResolvedValue(ongoingGame);

			const updatedGame = {
				...ongoingGame,
				currentFEN:
					'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
				movesPGN: expect.any(String),
			};

			mockPrismaService.game.update.mockResolvedValue(updatedGame);

			const result = await service.makeMove(1, { move: 'e4' }, 1);

			expect(mockPrismaService.game.update).toHaveBeenCalledWith({
				where: expect.objectContaining({
					id: 1,
				}),
				data: expect.objectContaining({
					status: GameStatus.ONGOING,
					currentFEN: expect.any(String),
					movesPGN: expect.any(String),
				}),
			});

			expect(result.movesPGN).toEqual(expect.any(String));
		});
	});
});
