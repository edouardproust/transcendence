import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { usersFixture, UsersServiceMock } from './users.service.mock';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

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
			await expect(controller.findOneById(1337)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('deleteOne', () => {
		it('should call service.deleteOne with correct id', async () => {
			await controller.deleteOne(userFixture.id);
			expect(usersService.deleteOne).toHaveBeenCalledWith(userFixture.id);
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
});
