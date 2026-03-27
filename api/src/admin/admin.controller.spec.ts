// admin/admin.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { UsersServiceMock, usersFixture } from '../users/users.service.mock';
import { AdminServiceMock } from './admin.service.mock';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { AdminGamesQueryDto } from './dtos/admin-games-query.dto';
import { Role } from '../prisma/generated/client';
import { UpdateUserAdminDto } from '../users/dtos/update-user-admin.dto';
import { ForbiddenException } from '@nestjs/common';

describe('AdminController', () => {
	let controller: AdminController;
	let adminService: AdminService;
	let usersService: UsersService;
	const userFixture = usersFixture[0];

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AdminController],
			providers: [AdminServiceMock, UsersServiceMock],
		}).compile();
		controller = module.get<AdminController>(AdminController);
		adminService = module.get<AdminService>(AdminService);
		usersService = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('getUsers', () => {
		it('should call adminService.getUsers with correct query', async () => {
			const query: AdminUsersQueryDto = { page: 1, limit: 20 };
			await controller.getUsers(query);
			expect(adminService.getUsers).toHaveBeenCalledWith(query);
		});
	});

	describe('updateUser', () => {
		it('should call usersService.updateOneById with correct id and dto', async () => {
			const dto: UpdateUserAdminDto = { elo: 1400, role: Role.ADMIN };
			await controller.updateUser(userFixture.id, dto);
			expect(usersService.updateOneById).toHaveBeenCalledWith(
				userFixture.id,
				dto,
			);
		});
	});

	describe('deleteUser', () => {
		it('should call usersService.deleteOneById with correct id', async () => {
			await controller.deleteUser(userFixture.id, {
				id: 'other-id',
				role: Role.ADMIN,
			});
			expect(usersService.deleteOneById).toHaveBeenCalledWith(
				userFixture.id,
			);
		});

		it('should throw ForbiddenException when admin tries to delete themselves', async () => {
			await expect(
				controller.deleteUser(userFixture.id, {
					id: userFixture.id,
					role: Role.ADMIN,
				}),
			).rejects.toThrow(ForbiddenException);
		});
	});

	describe('getGames', () => {
		it('should call adminService.getGames with correct query', async () => {
			const query: AdminGamesQueryDto = { page: 1, limit: 20 };
			await controller.getGames(query);
			expect(adminService.getGames).toHaveBeenCalledWith(query);
		});
	});

	describe('deleteGame', () => {
		it('should call adminService.deleteGame with correct id', async () => {
			await controller.deleteGame('some-uuid');
			expect(adminService.deleteGame).toHaveBeenCalledWith('some-uuid');
		});
	});

	describe('getStats', () => {
		it('should call adminService.getStats', async () => {
			await controller.getStats();
			expect(adminService.getStats).toHaveBeenCalled();
		});
	});
});
