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

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	// ------------------------------------------------------------------ //
	// POST /games
	// ------------------------------------------------------------------ //
	describe('createGame', () => {
		it('should call service.createGame with dto and userId', async () => {
			(service.createGame as jest.Mock).mockResolvedValue(gameFixture);
			const req = { user: { id: 1 } };

			const result = await controller.createGame(
				{ timeControl: '10+0', mode: 'online' },
				req,
			);

			expect(service.createGame).toHaveBeenCalledWith(
				{ timeControl: '10+0', mode: 'online' },
				1,
			);
			expect(result).toEqual(gameFixture);
		});
	});

	// ------------------------------------------------------------------ //
	// GET /games/active
	// ------------------------------------------------------------------ //
	describe('getActiveGames', () => {
		it('should return list of active games', async () => {
			(service.getActiveGames as jest.Mock).mockResolvedValue([
				gameFixture,
			]);

			const result = await controller.getActiveGames();

			expect(service.getActiveGames).toHaveBeenCalled();
			expect(result).toEqual([gameFixture]);
		});
	});

	// ------------------------------------------------------------------ //
	// GET /games/user
	// ------------------------------------------------------------------ //
	describe('getUserGames', () => {
		it('should call service.getUserGames with userId', async () => {
			(service.getUserGames as jest.Mock).mockResolvedValue([
				gameFixture,
			]);
			const req = { user: { id: 1 } };

			const result = await controller.getUserGames(req);

			expect(service.getUserGames).toHaveBeenCalledWith(1);
			expect(result).toEqual([gameFixture]);
		});
	});

	// ------------------------------------------------------------------ //
	// GET /games/:id
	// ------------------------------------------------------------------ //
	describe('getGame', () => {
		it('should call service.getGame with id', async () => {
			(service.getGame as jest.Mock).mockResolvedValue(gameFixture);

			const result = await controller.getGame(1);

			expect(service.getGame).toHaveBeenCalledWith(1);
			expect(result).toEqual(gameFixture);
		});
	});

	// ------------------------------------------------------------------ //
	// POST /games/:id/start
	// ------------------------------------------------------------------ //
	describe('startGame', () => {
		it('should call service.startGame with id and userId', async () => {
			(service.startGame as jest.Mock).mockResolvedValue({
				...gameFixture,
				status: 'ongoing',
			});
			const req = { user: { id: 1 } };

			const result = await controller.startGame(1, req);

			expect(service.startGame).toHaveBeenCalledWith(1, 1);
			expect(result.status).toBe('ongoing');
		});
	});

	// ------------------------------------------------------------------ //
	// POST /games/:id/finish
	// ------------------------------------------------------------------ //
	describe('finishGame', () => {
		it('should call service.finishGame with id, dto and userId', async () => {
			(service.finishGame as jest.Mock).mockResolvedValue({
				...gameFixture,
				status: 'finished',
			});
			const req = { user: { id: 1 } };
			const dto = { winnerId: 1, currentFen: 'some-fen', pgn: '1. e4' };

			const result = await controller.finishGame(1, dto, req);

			expect(service.finishGame).toHaveBeenCalledWith(1, dto, 1);
			expect(result.status).toBe('finished');
		});
	});

	// ------------------------------------------------------------------ //
	// POST /games/:id/move
	// ------------------------------------------------------------------ //
	describe('makeMove', () => {
		it('should call service.makeMove with id, dto and userId', async () => {
			(service.makeMove as jest.Mock).mockResolvedValue(gameFixture);
			const req = { user: { id: 1 } };

			const result = await controller.makeMove(1, { move: 'e4' }, req);

			expect(service.makeMove).toHaveBeenCalledWith(1, { move: 'e4' }, 1);
			expect(result).toEqual(gameFixture);
		});
	});
});
