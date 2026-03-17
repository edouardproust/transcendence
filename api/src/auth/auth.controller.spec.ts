import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceMock } from './auth.service.mock';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { usersFixture, UsersServiceMock } from '../users/users.service.mock';
import { RequestUser } from './interfaces/request-user.interface';
import { UsersService } from '../users/users.service';
import { Role } from '../prisma/generated/enums';

describe('AuthController', () => {
	let controller: AuthController;
	let authService: AuthService;
	let usersService: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [AuthServiceMock, UsersServiceMock],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
		usersService = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('register', () => {
		it('should call authService.register with correct dto', async () => {
			const dto: CreateUserDto = {
				username: 'testuser',
				email: 'test@test.com',
				password: 'password123',
			};
			await controller.register(dto);
			expect(authService.register).toHaveBeenCalledWith(dto);
		});
	});

	describe('login', () => {
		it('should call authService.login with correct dto', async () => {
			const dto: LoginDto = {
				emailOrUsername: 'test@test.com',
				password: 'password123',
			};
			await controller.login(dto);
			expect(authService.login).toHaveBeenCalledWith(dto);
		});
	});

	describe('me', () => {
		it('should call usersService.findOneById with user id', async () => {
			const user: RequestUser = {
				id: usersFixture[0].id,
				role: Role.user,
			};
			await controller.me(user);
			expect(usersService.findOneById).toHaveBeenCalledWith(
				usersFixture[0].id,
			);
		});
	});

	describe('logout', () => {
		it('should return logout message', () => {
			const result = controller.logout();
			expect(result).toEqual({ message: 'Logged out' });
		});
	});
});
