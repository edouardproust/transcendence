import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/prisma/generated/enums';

describe('AppController (e2e)', () => {
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

	afterEach(async () => {
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await app.close();
	});

	const password = 'plainpassword';
	const makeUser = async (email: string = 'test@example.com') => {
		return {
			email,
			password: await bcrypt.hash(password, 10),
		};
	};
	const seedUser = async (email: string = 'test@example.com') => {
		return prisma.user.create({
			data: await makeUser(email),
		});
	};
	const seedAdmin = async (email: string = 'admin@example.com') => {
		return prisma.user.create({
			data: { ...(await makeUser(email)), role: Role.ADMIN },
		});
	};
	const login = async (email: string, password: string) => {
		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email, password })
			.expect(200);
		return response.body.access_token;
	};

	// E2E TESTS

	describe('GET /users', () => {
		const getUsers = async (token: string) => {
			return request(app.getHttpServer())
				.get('/users')
				.set('Authorization', `Bearer ${token}`);
		};

		it('should return 401 if token is invalid', async () => {
			const response = await getUsers('invalidtoken');
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 403 if authenticated but not admin', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await getUsers(token);
			expect(response.status).toBe(HttpStatus.FORBIDDEN);
		});

		it('should return list of users if authenticated as admin', async () => {
			const admin = await seedAdmin();
			const token = await login(admin.email, password);
			const response = await getUsers(token);
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveLength(1); // Only the seeded admin user should be present
			expect(response.body[0].email).toBe(admin.email); // Check that the correct user is returned
			expect(response.body[0].password).toBeUndefined(); // Password should be omitted
		});
	});

	describe('GET /users/:id', () => {
		const getUser = async (id: string, token: string) => {
			return request(app.getHttpServer())
				.get(`/users/${id}`)
				.set('Authorization', `Bearer ${token}`);
		};

		it('should return 401 if token is invalid', async () => {
			const response = await getUser('1', 'invalidtoken');
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 403 if authenticated but not owner or admin', async () => {
			const user = await seedUser();
			const otherUser = await seedUser('test2@example.com');
			const token = await login(otherUser.email, password);
			const response = await getUser(user.id.toString(), token);
			expect(response.status).toBe(HttpStatus.FORBIDDEN);
		});

		it('should return 404 if user not found', async () => {
			const admin = await seedAdmin();
			const token = await login(admin.email, password);
			const response = await getUser('999', token); // Assuming 999 is a non-existent user ID
			expect(response.status).toBe(HttpStatus.NOT_FOUND);
			expect(response.body.message).toBe('User not found');
		});

		it('should return user data if authenticated as owner', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await getUser(user.id.toString(), token);
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.email).toBe(user.email); // Check that the correct user is returned
			expect(response.body.password).toBeUndefined(); // Password should be omitted
		});

		it('should return user data if authenticated as admin', async () => {
			const user = await seedUser();
			const admin = await seedAdmin();
			const token = await login(admin.email, password);
			const response = await getUser(user.id.toString(), token);
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.email).toBe(user.email);
			expect(response.body.password).toBeUndefined();
		});
	});

	describe('DELETE /users/:id', () => {
		const deleteUser = async (id: string, token: string) => {
			return request(app.getHttpServer())
				.delete(`/users/${id}`)
				.set('Authorization', `Bearer ${token}`);
		};

		it('should return 401 if token is invalid', async () => {
			const response = await deleteUser('1', 'invalidtoken');
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 403 if authenticated but not owner or admin', async () => {
			const user = await seedUser();
			const otherUser = await seedUser('test2@example.com');
			const token = await login(otherUser.email, password);
			const response = await deleteUser(user.id.toString(), token);
			expect(response.status).toBe(HttpStatus.FORBIDDEN);
		});

		it('should return 404 if user not found', async () => {
			const admin = await seedAdmin();
			const token = await login(admin.email, password);
			const response = await deleteUser('999', token); // Assuming 999 is a non-existent user ID
			expect(response.status).toBe(HttpStatus.NOT_FOUND);
			expect(response.body.message).toBe('User not found');
		});

		it('should delete user if authenticated as owner', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await deleteUser(user.id.toString(), token);
			expect(response.status).toBe(HttpStatus.NO_CONTENT);
			// Verify that the user is actually deleted
			const deletedUser = await prisma.user.findUnique({
				where: { id: user.id },
			});
			expect(deletedUser).toBeNull();
		});

		it('should delete user if authenticated as admin', async () => {
			const user = await seedUser();
			const admin = await seedAdmin();
			const token = await login(admin.email, password);
			const response = await deleteUser(user.id.toString(), token);
			expect(response.status).toBe(HttpStatus.NO_CONTENT);
			// Verify that the user is actually deleted
			const deletedUser = await prisma.user.findUnique({
				where: { id: user.id },
			});
			expect(deletedUser).toBeNull();
		});
	});

	describe('PATCH /users/:id', () => {
		const updateUser = async (id: string, token: string, data: any) => {
			return request(app.getHttpServer())
				.patch(`/users/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(data);
		};

		it('should return 401 if token is invalid', async () => {
			const response = await updateUser('1', 'invalidtoken', {
				username: 'newusername',
			});
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 403 if authenticated but not owner or admin', async () => {
			const user = await seedUser();
			const otherUser = await seedUser('test2@example.com');
			const token = await login(otherUser.email, password);
			const response = await updateUser(user.id.toString(), token, {
				username: 'newusername',
			});
			expect(response.status).toBe(HttpStatus.FORBIDDEN);
		});

		it('should return 404 if user not found', async () => {
			const admin = await seedAdmin();
			const token = await login(admin.email, password);
			const response = await updateUser('999', token, {
				username: 'newusername',
			});
			expect(response.status).toBe(HttpStatus.NOT_FOUND);
			expect(response.body.message).toBe('User not found');
		});

		it('should update user if authenticated as owner', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await updateUser(user.id.toString(), token, {
				username: 'newusername',
			});
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.username).toBe('newusername');
			// Verify that the user is actually updated in the database
			const updatedUser = await prisma.user.findUnique({
				where: { id: user.id },
			});
			if (updatedUser) {
				expect(updatedUser.username).toBe('newusername');
			} else {
				fail('User not found in database after update');
			}
		});

		it('should update user if authenticated as admin', async () => {
			const user = await seedUser();
			const admin = await seedAdmin();
			const token = await login(admin.email, password);
			const response = await updateUser(user.id.toString(), token, {
				username: 'newusername',
			});
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.username).toBe('newusername');
		});

		it('should hash password if password is updated', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const newPassword = 'newplainpassword';
			const response = await updateUser(user.id.toString(), token, {
				password: newPassword,
			});
			expect(response.status).toBe(HttpStatus.OK);
			// Verify that the password is actually hashed in the database
			const updatedUser = await prisma.user.findUnique({
				where: { id: user.id },
			});
			if (updatedUser) {
				const isPasswordHashed = await bcrypt.compare(
					newPassword,
					updatedUser.password,
				);
				expect(isPasswordHashed).toBe(true);
			} else {
				fail('User not found in database after password update');
			}
		});

		it('should not update role even if role is provided in the request body', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await updateUser(user.id.toString(), token, {
				role: Role.ADMIN,
			});
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.role).toBe(Role.USER); // Role should remain unchanged
			// Verify that the role is actually unchanged in the database
			const updatedUser = await prisma.user.findUnique({
				where: { id: user.id },
			});
			if (updatedUser) {
				expect(updatedUser.role).toBe(Role.USER);
			} else {
				fail('User not found in database after update');
			}
		});

		it('should ignore extra fields in the request body', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await updateUser(user.id.toString(), token, {
				username: 'newusername',
				extraField: 'extradata',
			});
			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.username).toBe('newusername');
			expect(response.body.extraField).toBeUndefined(); // Extra field should be ignored
		});

		it('should return 400 if request body is invalid', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await updateUser(user.id.toString(), token, {
				username: 123, // Invalid type, should be a string
			});
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 if password is too short', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await updateUser(user.id.toString(), token, {
				password: 'short', // Too short, should be at least 8 characters
			});
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 if email is invalid', async () => {
			const user = await seedUser();
			const token = await login(user.email, password);
			const response = await updateUser(user.id.toString(), token, {
				email: 'invalidemail', // Invalid email format
			});
			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});
	});
});
