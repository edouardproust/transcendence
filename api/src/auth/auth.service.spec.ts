import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
	UsersServiceMock,
	userInDb,
	usersFixture,
} from '../users/users.service.mock';
import { JwtServiceMock } from './auth.service.mock';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

jest.mock('bcrypt', () => ({
	hash: jest.fn().mockResolvedValue('hashedPassword'),
	compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
	let service: AuthService;
	let usersService: UsersService;
	let jwtService: JwtService;

	const userWithPassword = { ...userInDb, password: 'hashedPassword' };

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
		const createUserDto: CreateUserDto = {
			email: 'new@example.com',
			password: 'password123',
			username: 'testuser',
		};
		it('should call usersService.createOne and jwtService.sign', async () => {
			jest.spyOn(usersService, 'createOne').mockResolvedValue(
				userInDb as any,
			);
			jest.spyOn(jwtService, 'sign').mockReturnValue('token');

			await service.register(createUserDto);

			expect(usersService.createOne).toHaveBeenCalledWith(createUserDto);
			expect(jwtService.sign).toHaveBeenCalledWith({
				sub: userInDb.id,
				role: userInDb.role,
			});
		});
	});

	describe('login', () => {
		const password = 'password123';
		const token = 'token';

		it('should return user without password and access token when credentials are valid', async () => {
			jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(
				userWithPassword as any,
			);
			jest.spyOn(jwtService, 'sign').mockReturnValue('token');

			const result = await service.login({
				emailOrUsername: userWithPassword.email,
				password,
			});

			expect(usersService.findOneByEmail).toHaveBeenCalledWith(
				userWithPassword.email,
			);
			expect(result).toEqual({
				user: userInDb,
				token,
			});
		});

		it('should return user without password and access token when username is valid', async () => {
			jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(
				userWithPassword as any,
			);
			jest.spyOn(jwtService, 'sign').mockReturnValue('token');

			const result = await service.login({
				emailOrUsername: userWithPassword.username,
				password,
			});

			expect(usersService.findOneByUsername).toHaveBeenCalledWith(
				userWithPassword.username,
			);
			expect(result).toEqual({
				user: userInDb,
				token,
			});
		});

		it('should throw UnauthorizedException when user not found', async () => {
			jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

			await expect(
				service.login({
					emailOrUsername: 'unknown@test.com',
					password,
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
					emailOrUsername: userWithPassword.email,
					password: 'wrongpassword',
				}),
			).rejects.toThrow(UnauthorizedException);
		});
	});
});
