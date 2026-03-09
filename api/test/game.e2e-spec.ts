import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

	describe('POST /games', () => {
		const createGame = async (token: string, body: object) => {
			return request(app.getHttpServer())
				.post('/games')
				.set('Authorization', `Bearer ${token}`)
				.send(body);
		};

		it('should return 401 if not authenticated', async () => {
			const response = await request(app.getHttpServer())
				.post('/games')
				.send({ whiteId: 1, blackId: 2 });
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 if players are the same', async () => {
			const user = await seedUser('player@example.com');
			const token = await login(user.email);
			const response = await createGame(token, {
				whiteId: user.id,
				blackId: user.id,
			});
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 if a player does not exist', async () => {
			const user = await seedUser('player@example.com');
			const token = await login(user.email);
			const response = await createGame(token, {
				whiteId: user.id,
				blackId: 9999,
			});
			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should create a game if players are valid', async () => {
			const white = await seedUser('white@example.com');
			const black = await seedUser('black@example.com');
			const token = await login(white.email);
			const response = await createGame(token, {
				whiteId: white.id,
				blackId: black.id,
			});
			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body.whiteId).toBe(white.id);
			expect(response.body.blackId).toBe(black.id);
		});
	});
});
