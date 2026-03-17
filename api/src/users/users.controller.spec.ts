import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { usersFixture, UsersServiceMock } from './users.service.mock';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchUsersDto } from './dto/search-users.dto';

describe('UsersController', () => {
	let controller: UsersController;
	let usersService: UsersService;

	const userFixture = usersFixture[0];

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [UsersServiceMock],
		}).compile();

		controller = module.get<UsersController>(UsersController);
		usersService = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('findAll', () => {
		it('should call service.findAll', async () => {
			await controller.findAll();
			expect(usersService.findAll).toHaveBeenCalled();
		});
	});

	describe('findOneById', () => {
		it('should call service.findOneById with correct id', async () => {
			jest.spyOn(usersService, 'findOneById').mockResolvedValue(
				userFixture,
			);
			await controller.findOneById(userFixture.id);
			expect(usersService.findOneById).toHaveBeenCalledWith(
				userFixture.id,
			);
		});

		it('should throw NotFoundException when user not found', async () => {
			jest.spyOn(usersService, 'findOneById').mockResolvedValue(null);
			await expect(
				controller.findOneById('invalid-uuid'),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('deleteOne', () => {
		it('should call service.deleteOne with correct id', async () => {
			await controller.deleteOne(userFixture.id);
			expect(usersService.deleteOneById).toHaveBeenCalledWith(
				userFixture.id,
			);
		});
	});

	describe('updateOne', () => {
		it('should call service.updateOneById with correct id and dto', async () => {
			const updateUserDto: UpdateUserDto = {
				email: 'updated@example.com',
			};
			await controller.updateOne(userFixture.id, updateUserDto);
			expect(usersService.updateOneById).toHaveBeenCalledWith(
				userFixture.id,
				updateUserDto,
			);
		});
	});

	describe('search', () => {
		it('should call service.search with correct query', async () => {
			const query = { query: 'john' };
			await controller.search(query as SearchUsersDto);
			expect(usersService.search).toHaveBeenCalledWith('john');
		});
	});

	describe('getOwnProfile', () => {
		it('should call service.findProfileById with user id and includeEmail=true', async () => {
			const user: RequestUser = {
				id: userFixture.id,
				role: userFixture.role,
			};
			await controller.getOwnProfile(user);
			expect(usersService.findProfileById).toHaveBeenCalledWith(
				userFixture.id,
				true,
			);
		});
	});

	describe('getProfileById', () => {
		it('should call service.findProfileById with correct id', async () => {
			await controller.getProfileById(userFixture.id);
			expect(usersService.findProfileById).toHaveBeenCalledWith(
				userFixture.id,
			);
		});
	});

	describe('updateProfile', () => {
		it('should call service.updateOneById with user id and dto', async () => {
			const user: RequestUser = {
				id: userFixture.id,
				role: userFixture.role,
			};
			const dto: UpdateProfileDto = { username: 'newusername' };
			await controller.updateProfile(user, dto);
			expect(usersService.updateOneById).toHaveBeenCalledWith(
				userFixture.id,
				dto,
			);
		});
	});
});
