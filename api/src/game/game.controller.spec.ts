import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameServiceMock, gameFixture } from './game.service.mock';

describe('GameController', () => {
	let controller: GameController;
	let service: GameService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GameController],
			providers: [GameServiceMock],
		}).compile();

		controller = module.get<GameController>(GameController);
		service = module.get<GameService>(GameService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should create a game', async () => {
		jest.spyOn(service, 'createGame').mockResolvedValue(gameFixture);

		const result = await controller.createGame({
			whiteId: 1,
			blackId: 2,
		});

		expect(result).toEqual(gameFixture);
		expect(service.createGame).toHaveBeenCalled();
	});

	it('should get a game', async () => {
		jest.spyOn(service, 'getGame').mockResolvedValue(gameFixture);

		const result = await controller.getGame(1);

		expect(result).toEqual(gameFixture);
		expect(service.getGame).toHaveBeenCalled();
	});
});
