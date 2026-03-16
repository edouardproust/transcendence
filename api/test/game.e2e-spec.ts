import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { GameStatus } from '../src/prisma/generated/enums';

describe('GameController (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
		prisma = moduleFixture.get<PrismaService>(PrismaService);
		await app.init();
	});

	beforeEach(async () => {
		await prisma.game.deleteMany();
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await app.close();
	});

	const seedUser = async (email: string) => {
		return prisma.user.create({
			data: {
				email,
				password: await bcrypt.hash('password123', 10),
			},
		});
	};

	const login = async (email: string) => {
		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email, password: 'password123' })
			.expect(200);

		return response.body.access_token;
	};

	describe('POST /games/:id/move', () => {
		const makeMove = async (
			token: string,
			gameId: number,
			move: string,
		) => {
			return request(app.getHttpServer())
				.post(`/games/${gameId}/move`)
				.set('Authorization', `Bearer ${token}`)
				.send({ move });
		};

		it('should return 400 if game is already finished', async () => {
			const white = await seedUser('white@example.com');
			const black = await seedUser('black@example.com');
			const token = await login(white.email);

			const game = await request(app.getHttpServer())
				.post('/games')
				.set('Authorization', `Bearer ${token}`)
				.send({ whiteId: white.id, blackId: black.id })
				.expect(HttpStatus.CREATED);

			await prisma.game.update({
				where: { id: game.body.id },
				data: { status: GameStatus.FINISHED },
			});

			const response = await makeMove(token, game.body.id, 'e4');

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 and updated game on valid move', async () => {
			const white = await seedUser('white@example.com');
			const black = await seedUser('black@example.com');
			const token = await login(white.email);

			const game = await request(app.getHttpServer())
				.post('/games')
				.set('Authorization', `Bearer ${token}`)
				.send({ whiteId: white.id, blackId: black.id })
				.expect(HttpStatus.CREATED);

			const response = await makeMove(token, game.body.id, 'e4');

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.movesPGN).toContain('e4');
			expect(response.body.status).toBe(GameStatus.ONGOING);
		});
	});
});
