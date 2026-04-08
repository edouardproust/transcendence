import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameServiceMock, gameFixture } from './game.service.mock';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { GameMode } from '../prisma/generated/enums';
import { EXAMPLES } from '../common/constants';

describe('GameController', () => {
	let controller: GameController;
	let gameService: GameService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GameController],
			providers: [GameServiceMock],
		}).compile();

		controller = module.get<GameController>(GameController);
		gameService = module.get<GameService>(GameService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('createGame', () => {
		it('should call service.createGame with dto and userId', async () => {
			const user: RequestUser = { id: EXAMPLES.id, role: EXAMPLES.role };
			const dto = {
				timeControl: EXAMPLES.timeControl,
				mode: GameMode.ONLINE,
			};
			jest.spyOn(gameService, 'createGame').mockResolvedValue(
				gameFixture,
			);
			await controller.createGame(dto, user);
			expect(gameService.createGame).toHaveBeenCalledWith(dto, user.id);
		});
	});

	describe('getActiveGames', () => {
		it('should call service.getActiveGames', async () => {
			jest.spyOn(gameService, 'getActiveGames').mockResolvedValue([
				gameFixture,
			]);
			await controller.getActiveGames();
			expect(gameService.getActiveGames).toHaveBeenCalled();
		});
	});

	describe('getUserGames', () => {
		it('should call service.getUserGames with userId', async () => {
			const user: RequestUser = { id: EXAMPLES.id, role: EXAMPLES.role };
			jest.spyOn(gameService, 'getUserGames').mockResolvedValue([
				gameFixture,
			]);
			await controller.getUserGames(user);
			expect(gameService.getUserGames).toHaveBeenCalledWith(user.id);
		});
	});

	describe('getGame', () => {
		it('should call service.getGame with id', async () => {
			jest.spyOn(gameService, 'getGame').mockResolvedValue(gameFixture);
			await controller.getGame(EXAMPLES.gameId);
			expect(gameService.getGame).toHaveBeenCalledWith(EXAMPLES.gameId);
		});
	});

	describe('startGame', () => {
		it('should call service.startGame with id and userId', async () => {
			const user: RequestUser = { id: EXAMPLES.id, role: EXAMPLES.role };
			jest.spyOn(gameService, 'startGame').mockResolvedValue(gameFixture);
			await controller.startGame(EXAMPLES.gameId, {}, user);
			expect(gameService.startGame).toHaveBeenCalledWith(
				EXAMPLES.gameId,
				user.id,
				{},
			);
		});
	});

	describe('finishGame', () => {
		it('should call service.finishGame with id, dto and userId', async () => {
			const user: RequestUser = { id: EXAMPLES.id, role: EXAMPLES.role };
			const dto = {
				winnerId: EXAMPLES.id,
				currentFen: 'some-fen',
				pgn: '1. e4',
			};
			jest.spyOn(gameService, 'finishGame').mockResolvedValue(
				gameFixture,
			);
			await controller.finishGame(EXAMPLES.gameId, dto, user);
			expect(gameService.finishGame).toHaveBeenCalledWith(
				EXAMPLES.gameId,
				dto,
				user.id,
			);
		});
	});

	describe('makeMove', () => {
		it('should call service.makeMove with id, dto and userId', async () => {
			const user: RequestUser = { id: EXAMPLES.id, role: EXAMPLES.role };
			const dto = { move: 'e4' };
			jest.spyOn(gameService, 'makeMove').mockResolvedValue(gameFixture);
			await controller.makeMove(EXAMPLES.gameId, dto, user);
			expect(gameService.makeMove).toHaveBeenCalledWith(
				EXAMPLES.gameId,
				dto,
				user.id,
			);
		});
	});
});
