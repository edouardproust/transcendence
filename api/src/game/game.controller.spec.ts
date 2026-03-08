import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';

describe('GameController', () => {
	let controller: GameController;

	const mockGameService = {
		createGame: jest.fn().mockReturnValue({
			message: 'Game created',
			players: {
				white: 1,
				black: 2,
			},
		}),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GameController],
			providers: [
				{
					provide: GameService,
					useValue: mockGameService,
				},
			],
		}).compile();

		controller = module.get<GameController>(GameController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should create a game', () => {
		const result = controller.createGame({
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

		expect(mockGameService.createGame).toHaveBeenCalled();
	});
});
