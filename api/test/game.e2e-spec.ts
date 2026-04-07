import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { GameController } from '../src/game/game.controller';
import { GameService } from '../src/game/game.service';
import { GameServiceMock, gameFixture } from '../src/game/game.service.mock';
import { JwtAuthGuard } from '../src/auth/guard/jwt-auth.guard';
import { EXAMPLES } from '../src/common/constants';
import { GameMode, GameStatus } from '../src/prisma/generated/enums';

const mockJwtGuard = {
	canActivate: (ctx) => {
		const req = ctx.switchToHttp().getRequest();
		req.user = { id: EXAMPLES.id };
		return true;
	},
};

describe('Game (e2e)', () => {
	let app: INestApplication;
	let service: GameService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GameController],
			providers: [GameServiceMock],
		})
			.overrideGuard(JwtAuthGuard)
			.useValue(mockJwtGuard)
			.compile();

		app = module.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({ transform: true, whitelist: true }),
		);
		await app.init();

		service = module.get<GameService>(GameService);
		jest.clearAllMocks();
	});

	afterEach(async () => {
		await app.close();
	});

	describe('POST /games', () => {
		it('should return 201 and the created game', async () => {
			(service.createGame as jest.Mock).mockResolvedValue(gameFixture);

			const res = await request(app.getHttpServer())
				.post('/games')
				.send({
					timeControl: EXAMPLES.timeControl,
					mode: GameMode.ONLINE,
				})
				.expect(201);

			expect(res.body.id).toBe(gameFixture.id);
			expect(service.createGame).toHaveBeenCalledWith(
				{ timeControl: EXAMPLES.timeControl, mode: GameMode.ONLINE },
				EXAMPLES.id,
			);
		});

		it('should return 400 if mode is invalid', async () => {
			await request(app.getHttpServer())
				.post('/games')
				.send({
					timeControl: EXAMPLES.timeControl,
					mode: 'invalid-mode',
				})
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 if timeControl is missing', async () => {
			await request(app.getHttpServer())
				.post('/games')
				.send({ mode: GameMode.ONLINE })
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe('GET /games/active', () => {
		it('should return 200 and a list of games', async () => {
			(service.getActiveGames as jest.Mock).mockResolvedValue([
				gameFixture,
			]);

			const res = await request(app.getHttpServer())
				.get('/games/active')
				.expect(HttpStatus.OK);

			expect(res.body).toHaveLength(1);
		});
	});

	describe('GET /games/user', () => {
		it('should return 200 and user games', async () => {
			(service.getUserGames as jest.Mock).mockResolvedValue([
				gameFixture,
			]);

			const res = await request(app.getHttpServer())
				.get('/games/user')
				.expect(HttpStatus.OK);

			expect(res.body).toHaveLength(1);
			expect(service.getUserGames).toHaveBeenCalledWith(EXAMPLES.id);
		});
	});

	describe('GET /games/:id', () => {
		it('should return 200 and the game', async () => {
			(service.getGame as jest.Mock).mockResolvedValue(gameFixture);

			const res = await request(app.getHttpServer())
				.get(`/games/${EXAMPLES.gameId}`)
				.expect(HttpStatus.OK);

			expect(res.body.id).toBe(gameFixture.id);
		});

		it('should return 400 if id is not a UUID', async () => {
			await request(app.getHttpServer())
				.get('/games/abc')
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe('POST /games/:id/start', () => {
		it('should return 200 and the started game', async () => {
			(service.startGame as jest.Mock).mockResolvedValue({
				...gameFixture,
				status: GameStatus.ONGOING,
			});

			const res = await request(app.getHttpServer())
				.post(`/games/${EXAMPLES.gameId}/start`)
				.expect(HttpStatus.OK);

			expect(res.body.status).toBe(GameStatus.ONGOING);
			expect(service.startGame).toHaveBeenCalledWith(
				EXAMPLES.gameId,
				EXAMPLES.id,
			);
		});
	});

	describe('POST /games/:id/finish', () => {
		it('should return 200 when finishing a game', async () => {
			(service.finishGame as jest.Mock).mockResolvedValue({
				...gameFixture,
				status: 'finished',
			});

			const res = await request(app.getHttpServer())
				.post(`/games/${EXAMPLES.gameId}/finish`)
				.send({
					winnerId: EXAMPLES.id,
					currentFen: 'some-fen',
					pgn: '1. e4',
				});
			expect(res.body.status).toBe('finished');
		});

		it('should return 400 if body is invalid', async () => {
			await request(app.getHttpServer())
				.post(`/games/${EXAMPLES.gameId}/finish`)
				.send({ winnerId: 1 }) // currentFen and pgn are missing
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe('POST /games/:id/move', () => {
		it('should return 200 and the updated game', async () => {
			(service.makeMove as jest.Mock).mockResolvedValue(gameFixture);

			const res = await request(app.getHttpServer())
				.post(`/games/${EXAMPLES.gameId}/move`)
				.send({
					move: {
						from: 'e2',
						to: 'e4',
					},
				})
				.expect(HttpStatus.OK);

			expect(res.body).toBeDefined();
			expect(service.makeMove).toHaveBeenCalledWith(
				EXAMPLES.gameId,
				{
					move: {
						from: 'e2',
						to: 'e4',
					},
				},
				EXAMPLES.id,
			);
		});

		it('should return 400 if move is missing', async () => {
			await request(app.getHttpServer())
				.post(`/games/${EXAMPLES.gameId}/move`)
				.send({})
				.expect(HttpStatus.BAD_REQUEST);
		});
	});
});
