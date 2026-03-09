import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
	user: {
		findUnique: jest.fn(),
	},
	game: {
		create: jest.fn(),
	},
};

describe('GameService', () => {
	let service: GameService;

	beforeEach(async () => {
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

	it('should create a game', async () => {
		mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
		mockPrismaService.game.create.mockResolvedValue({
			id: 1,
			whiteId: 1,
			blackId: 2,
		});

		const result = await service.createGame({ whiteId: 1, blackId: 2 });

		expect(result).toEqual({ id: 1, whiteId: 1, blackId: 2 });
	});

	it('should throw if players are the same', async () => {
		await expect(
			service.createGame({ whiteId: 1, blackId: 1 }),
		).rejects.toThrow(BadRequestException);
	});
});
