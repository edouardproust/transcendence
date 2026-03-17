// admin/admin.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/prisma.service.mock';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { AdminGamesQueryDto } from './dtos/admin-games-query.dto';
import { usersFixture } from '../users/users.service.mock';

describe('AdminService', () => {
	let service: AdminService;
	let prismaService: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AdminService, PrismaServiceMock],
		}).compile();
		service = module.get<AdminService>(AdminService);
		prismaService = module.get<PrismaService>(PrismaService);
	});

	describe('constructor', () => {
		it('should define needed services', () => {
			expect(service).toBeDefined();
			expect(prismaService).toBeDefined();
		});
	});

	describe('getUsers', () => {
		const query: AdminUsersQueryDto = { page: 1, limit: 20 };

		it('should return paginated users with totalGames mocked to 0', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(
				usersFixture,
			);
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(2);

			const result = await service.getUsers(query);

			expect(result.users).toHaveLength(2);
			expect(result.users[0].totalGames).toBe(0);
			expect(result.pagination).toEqual({
				total: 2,
				page: 1,
				limit: 20,
				totalPages: 1,
			});
		});

		it('should filter by search when provided', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([
				usersFixture[0],
			]);
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

			const queryWithSearch = { ...query, search: 'admin' };
			const result = await service.getUsers(queryWithSearch);

			expect(prismaService.user.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ OR: expect.any(Array) }),
				}),
			);
			expect(result.users).toHaveLength(1);
		});
	});

	describe('getStats', () => {
		it('should return stats with mocked game data', async () => {
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(10);
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(
				usersFixture,
			);

			const result = await service.getStats();

			expect(result.stats.totalUsers).toBe(10);
			expect(result.stats.newUsersWeek).toBe(10);
			expect(result.stats.totalGames).toBe(0);
			expect(result.topPlayers).toEqual(usersFixture);
			expect(result.recentActivity).toEqual([]);
		});
	});

	describe('getGames', () => {
		it('should return empty placeholder until games module is ready', async () => {
			const query: AdminGamesQueryDto = { page: 1, limit: 20 };
			const result = await service.getGames(query);

			expect(result.games).toEqual([]);
			expect(result.pagination.total).toBe(0);
			expect(result.pagination.page).toBe(1);
		});
	});

	describe('deleteGame', () => {
		it('should do nothing until games module is ready', async () => {
			await expect(
				service.deleteGame('some-uuid'),
			).resolves.toBeUndefined();
		});
	});
});
