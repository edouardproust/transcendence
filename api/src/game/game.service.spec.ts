import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GameService } from './game.service';

describe('GameService', () => {
	let service: GameService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [GameService],
		}).compile();

		service = module.get<GameService>(GameService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	it('should create a game', () => {
		const result = service.createGame({
			whiteId: 1,
			blackId: 2,
		});

		expect(result).toEqual({
			message: 'Game created',
			players: {
				white: 1,
				black: 2,
			},
		});
	});

	it('should throw if players are the same', () => {
		expect(() =>
			service.createGame({
				whiteId: 1,
				blackId: 1,
			}),
		).toThrow(BadRequestException);
	});
});
