import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceMock } from './auth.service.mock';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UsersServiceMock } from '../users/users.service.mock';

describe('AuthController', () => {
	let controller: AuthController;
	let authService: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [AuthServiceMock, UsersServiceMock],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
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
});
