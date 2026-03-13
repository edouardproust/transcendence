import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';

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
				currentFEN:
					'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				movesPGN: expect.stringContaining(
					'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				),
			}),
		});
	});

	it('should return the created game', async () => {
		const mockGame = {
			id: 1,
			whiteId: 1,
			blackId: 2,
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

	it('should check both players exist', async () => {
		mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
		mockPrismaService.game.create.mockResolvedValue({ id: 1 });

		await service.createGame({ whiteId: 1, blackId: 2 });

		expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(2);
	});

	it('should throw if game not found', async () => {
		mockPrismaService.game.findUnique.mockResolvedValue(null);

		await expect(service.getGame(1)).rejects.toThrow(NotFoundException);
	});

	const ongoingGame = {
		id: 1,
		whiteId: 1,
		blackId: 2,
		ongoing: true,
		result: null,
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
				ongoing: false,
				result: 'white',
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
			mockPrismaService.game.update.mockResolvedValue({
				...ongoingGame,
				currentFEN:
					'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
				movesPGN: '1. e4',
			});

			const result = await service.makeMove(1, { move: 'e4' }, 1);

			expect(mockPrismaService.game.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: expect.objectContaining({ ongoing: true, result: null }),
			});
			expect(result.movesPGN).toBe('1. e4');
		});

		it('should set ongoing=false and result="1-0" on white checkmate', async () => {
			const scholarMateSetup = {
				...ongoingGame,
				movesPGN: '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6',
				currentFEN:
					'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
			};
			mockPrismaService.game.findUnique.mockResolvedValue(
				scholarMateSetup,
			);
			mockPrismaService.game.update.mockResolvedValue({
				...scholarMateSetup,
				ongoing: false,
				result: '1-0',
			});

			const updated = await service.makeMove(1, { move: 'Qxf7#' }, 1);

			expect(mockPrismaService.game.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: expect.objectContaining({
					ongoing: false,
					result: '1-0',
				}),
			});
			expect(updated.ongoing).toBe(false);
			expect(updated.result).toBe('1-0');
		});

		it('should set ongoing=false and result="1/2-1/2" on stalemate', async () => {
			const stalemateSetup = {
				...ongoingGame,
				whiteId: 1,
				blackId: 2,
				movesPGN: '',
				currentFEN: '8/4QK1k/8/8/8/8/8/8 w - - 0 1',
			};
			mockPrismaService.game.findUnique.mockResolvedValue(stalemateSetup);
			mockPrismaService.game.update.mockResolvedValue({
				...stalemateSetup,
				ongoing: false,
				result: '1/2-1/2',
			});

			const updated = await service.makeMove(1, { move: 'Qf8' }, 1);

			expect(mockPrismaService.game.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: expect.objectContaining({
					ongoing: false,
					result: '1/2-1/2',
				}),
			});
			expect(updated.ongoing).toBe(false);
			expect(updated.result).toBe('1/2-1/2');
		});
	});
});
