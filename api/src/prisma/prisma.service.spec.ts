import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { Logger } from '@nestjs/common';

describe('PrismaService', () => {
	let service: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PrismaService],
		}).compile();
		service = module.get<PrismaService>(PrismaService);
	});

	afterEach(async () => {
		await service.$disconnect();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('onModuleInit', () => {
		it('should connect to database and log success', async () => {
			jest.spyOn(service, '$connect').mockResolvedValue();
			jest.spyOn(Logger, 'log').mockImplementation();

			await service.onModuleInit();

			expect(service.$connect).toHaveBeenCalled();
			expect(Logger.log).toHaveBeenCalledWith(
				'Database connection established',
			);
		});

		it('should log error and rethrow when connection fails', async () => {
			const error = new Error('Connection failed');
			jest.spyOn(service, '$connect').mockRejectedValue(error);
			jest.spyOn(Logger, 'error').mockImplementation();

			await expect(service.onModuleInit()).rejects.toThrow(
				'Connection failed',
			);
			expect(Logger.error).toHaveBeenCalledWith(
				'Database connection failed',
				error,
			);
		});
	});

	describe('onModuleDestroy', () => {
		it('should disconnect from database and log success', async () => {
			jest.spyOn(service, '$disconnect').mockResolvedValue();
			jest.spyOn(Logger, 'log').mockImplementation();

			await service.onModuleDestroy();

			expect(service.$disconnect).toHaveBeenCalled();
			expect(Logger.log).toHaveBeenCalledWith(
				'Database connection closed',
			);
		});
	});
});
