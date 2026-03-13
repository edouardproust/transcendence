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
});
