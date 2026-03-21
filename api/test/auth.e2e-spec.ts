import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersService } from '../src/users/users.service';

describe('AuthController (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	let userService: UsersService;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
		prisma = moduleFixture.get<PrismaService>(PrismaService);
		userService = moduleFixture.get<UsersService>(UsersService);
		await app.init();
	});

	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await app.close();
	});

	const password = 'Password123#';
	const email = 'test@example.com';
	const username = 'testuser';

	// E2E TESTS

	describe('POST /auth/register', () => {
		const registerUser = async (
			email: string,
			username: string,
			password: string,
		) =>
			await request(app.getHttpServer()).post('/auth/register').send({
				email,
				password,
				username,
			});

		it('should return 201 Created', async () => {
			const response = await registerUser(email, username, password);
			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('token');
			expect(response.body.user).toMatchObject({ email: email });
			expect(response.body.user).not.toHaveProperty('password');
		});

		it('should hash password in database', async () => {
			await registerUser(email, username, password);
			const userInDb = await userService.findOneByEmail(email);
			const isHashed = await bcrypt.compare(password, userInDb!.password);
			expect(isHashed).toBe(true);
		});

		it('should return 409 Conflict if email is already registered', async () => {
			await registerUser(email, username, password);
			const response = await registerUser(
				email,
				'anotherUsername',
				password,
			);
			expect(response.status).toBe(HttpStatus.CONFLICT);
		});

		it('should return 409 Conflict if username is already registered', async () => {
			await registerUser(email, username, password);
			const response = await registerUser(
				'another@example.com',
				username,
				password,
			);
			expect(response.status).toBe(HttpStatus.CONFLICT);
		});

		it('should return 400 Bad Request if email format is invalid', async () => {
			const response = await registerUser(
				'invalid-email',
				username,
				password,
			);
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request if username is too short', async () => {
			const response = await registerUser(email, 'ab', password);
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request if username contains invalid characters', async () => {
			const response = await registerUser(
				email,
				'invalid user!',
				password,
			);
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request if password is too short', async () => {
			const response = await registerUser(email, username, '123');
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request if password format is invalid', async () => {
			const response = await registerUser(
				email,
				username,
				'nouppercase1!',
			);
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});
	});

	describe('POST /login', () => {
		const loginUser = async (email: string, password: string) =>
			await request(app.getHttpServer()).post('/auth/login').send({
				emailOrUsername: email,
				password,
			});

		beforeEach(async () => {
			await userService.createOne({
				email,
				username,
				password,
			});
		});

		it('should return 200 OK and access token when logging in with email', async () => {
			const response = await loginUser(email, password);
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('token');
			expect(response.body.user).toMatchObject({ email });
			expect(response.body.user).not.toHaveProperty('password');
		});

		it('should return 200 OK and access token when logging in with username', async () => {
			const response = await loginUser(username, password);
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('token');
			expect(response.body.user).toMatchObject({ username });
			expect(response.body.user).not.toHaveProperty('password');
		});

		it('should return 401 Unauthorized if email is not registered', async () => {
			const response = await loginUser(
				'nonexistent@example.com',
				password,
			);
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized if username is not registered', async () => {
			const response = await loginUser('non-existent-username', password);
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized if password is incorrect', async () => {
			const response = await loginUser(email, 'wrongpassword');
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});
	});
});
