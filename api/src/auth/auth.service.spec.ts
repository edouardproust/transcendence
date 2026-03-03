import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UsersServiceMock, usersFixture } from '../users/users.service.mock';
import { JwtServiceMock } from './auth.service.mock';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
	hash: jest.fn().mockResolvedValue('hashedPassword'),
	compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
	let service: AuthService;
	let usersService: UsersService;
	let jwtService: JwtService;

	const userWithPassword = { ...usersFixture[0], password: 'hashedPassword' };

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AuthService, UsersServiceMock, JwtServiceMock],
		}).compile();

		service = module.get<AuthService>(AuthService);
		usersService = module.get<UsersService>(UsersService);
		jwtService = module.get<JwtService>(JwtService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('register', () => {
		it('should call usersService.createOne and jwtService.sign', async () => {
			jest.spyOn(usersService, 'createOne').mockResolvedValue(
				usersFixture[0] as any,
			);
			jest.spyOn(jwtService, 'sign').mockReturnValue('token');

			await service.register({
				email: 'test@test.com',
				password: 'password123',
			});

			expect(usersService.createOne).toHaveBeenCalledWith({
				email: 'test@test.com',
				password: 'password123',
			});
			expect(jwtService.sign).toHaveBeenCalledWith({
				sub: usersFixture[0].id,
				role: usersFixture[0].role,
			});
		});
	});

	describe('login', () => {
		it('should return user without password and access token when credentials are valid', async () => {
			jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(
				userWithPassword as any,
			);
			jest.spyOn(jwtService, 'sign').mockReturnValue('token');

			const result = await service.login({
				email: userWithPassword.email,
				password: 'password123',
			});

			expect(result).toEqual({
				user: usersFixture[0],
				access_token: 'token',
			});
		});

		it('should throw UnauthorizedException when user not found', async () => {
			jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

			await expect(
				service.login({
					email: 'unknown@test.com',
					password: 'password123',
				}),
			).rejects.toThrow(UnauthorizedException);
		});

		it('should throw UnauthorizedException when password is invalid', async () => {
			jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(
				userWithPassword as any,
			);
			jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

			await expect(
				service.login({
					email: userWithPassword.email,
					password: 'wrongpassword',
				}),
			).rejects.toThrow(UnauthorizedException);
		});
	});

	describe('logout', () => {
		it('should return undefined', () => {
			expect(service.logout()).toBeUndefined();
		});
	});
});
