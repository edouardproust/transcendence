import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { GameController } from '../src/game/game.controller';
import { GameService } from '../src/game/game.service';
import { GameServiceMock, gameFixture } from '../src/game/game.service.mock';
import { JwtAuthGuard } from '../src/auth/guard/jwt-auth.guard';

const mockJwtGuard = {
	canActivate: (ctx) => {
		const req = ctx.switchToHttp().getRequest();
		req.user = { id: 1 };
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

	// ------------------------------------------------------------------ //
	// POST /games
	// ------------------------------------------------------------------ //
	describe('POST /games', () => {
		it('should return 201 and the created game', async () => {
			(service.createGame as jest.Mock).mockResolvedValue(gameFixture);

			const res = await request(app.getHttpServer())
				.post('/games')
				.send({ timeControl: '10+0', mode: 'online' })
				.expect(201);

			expect(res.body.id).toBe(gameFixture.id);
			expect(service.createGame).toHaveBeenCalledWith(
				{ timeControl: '10+0', mode: 'online' },
				1,
			);
		});

		it('should return 400 if mode is invalid', async () => {
			await request(app.getHttpServer())
				.post('/games')
				.send({ timeControl: '10+0', mode: 'invalid' })
				.expect(400);
		});

		it('should return 400 if timeControl is missing', async () => {
			await request(app.getHttpServer())
				.post('/games')
				.send({ mode: 'online' })
				.expect(400);
		});
	});

	// ------------------------------------------------------------------ //
	// GET /games/active
	// ------------------------------------------------------------------ //
	describe('GET /games/active', () => {
		it('should return 200 and a list of games', async () => {
			(service.getActiveGames as jest.Mock).mockResolvedValue([
				gameFixture,
			]);

			const res = await request(app.getHttpServer())
				.get('/games/active')
				.expect(200);

			expect(res.body).toHaveLength(1);
		});
	});

	// ------------------------------------------------------------------ //
	// GET /games/user
	// ------------------------------------------------------------------ //
	describe('GET /games/user', () => {
		it('should return 200 and user games', async () => {
			(service.getUserGames as jest.Mock).mockResolvedValue([
				gameFixture,
			]);

			const res = await request(app.getHttpServer())
				.get('/games/user')
				.expect(200);

			expect(res.body).toHaveLength(1);
			expect(service.getUserGames).toHaveBeenCalledWith(1);
		});
	});

	// ------------------------------------------------------------------ //
	// GET /games/:id
	// ------------------------------------------------------------------ //
	describe('GET /games/:id', () => {
		it('should return 200 and the game', async () => {
			(service.getGame as jest.Mock).mockResolvedValue(gameFixture);

			const res = await request(app.getHttpServer())
				.get('/games/1')
				.expect(200);

			expect(res.body.id).toBe(gameFixture.id);
		});

		it('should return 400 if id is not a number', async () => {
			await request(app.getHttpServer()).get('/games/abc').expect(400);
		});
	});

	// ------------------------------------------------------------------ //
	// POST /games/:id/start
	// ------------------------------------------------------------------ //
	describe('POST /games/:id/start', () => {
		it('should return 200 and the started game', async () => {
			(service.startGame as jest.Mock).mockResolvedValue({
				...gameFixture,
				status: 'ongoing',
			});

			const res = await request(app.getHttpServer())
				.post('/games/1/start')
				.expect(200);

			expect(res.body.status).toBe('ongoing');
			expect(service.startGame).toHaveBeenCalledWith(1, 1);
		});
	});

	// ------------------------------------------------------------------ //
	// POST /games/:id/finish
	// ------------------------------------------------------------------ //
	describe('POST /games/:id/finish', () => {
		it('should return 200 when finishing a game', async () => {
			(service.finishGame as jest.Mock).mockResolvedValue({
				...gameFixture,
				status: 'finished',
			});

			const res = await request(app.getHttpServer())
				.post('/games/1/finish')
				.send({ winnerId: 1, currentFen: 'some-fen', pgn: '1. e4' })
				.expect(200);

			expect(res.body.status).toBe('finished');
		});

		it('should return 400 if body is invalid', async () => {
			await request(app.getHttpServer())
				.post('/games/1/finish')
				.send({ winnerId: 1 }) // manque currentFen et pgn
				.expect(400);
		});
	});

	// ------------------------------------------------------------------ //
	// POST /games/:id/move
	// ------------------------------------------------------------------ //
	describe('POST /games/:id/move', () => {
		it('should return 200 and the updated game', async () => {
			(service.makeMove as jest.Mock).mockResolvedValue(gameFixture);

			const res = await request(app.getHttpServer())
				.post('/games/1/move')
				.send({ move: 'e4' })
				.expect(200);

			expect(res.body).toBeDefined();
			expect(service.makeMove).toHaveBeenCalledWith(1, { move: 'e4' }, 1);
		});

		it('should return 400 if move is missing', async () => {
			await request(app.getHttpServer())
				.post('/games/1/move')
				.send({})
				.expect(400);
		});
	});
});
