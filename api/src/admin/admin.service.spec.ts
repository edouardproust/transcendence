import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/prisma.service.mock';
import { usersFixture } from '../users/users.service.mock';
import { gameFixture } from '../game/game.service.mock';
import { GameStatus } from '../prisma/generated/enums';
import { prismaNotFoundException } from '../users/users.service.mock';
import { AdminGamesQueryDto } from './dtos/admin-games-query.dto';

const userWithCount = {
	...usersFixture[0],
	_count: { whiteGames: 3, blackGames: 2 },
};

const gameWithPlayers = {
	...gameFixture,
	white: { username: 'user1' },
	black: { username: 'user2' },
	winner: null,
};

describe('AdminService', () => {
	let service: AdminService;
	let prismaService: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AdminService, PrismaServiceMock],
		}).compile();
		service = module.get<AdminService>(AdminService);
		prismaService = module.get<PrismaService>(PrismaService);
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should define needed services', () => {
			expect(service).toBeDefined();
			expect(prismaService).toBeDefined();
		});
	});

	describe('getUsers', () => {
		it('should return paginated users with totalGames', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([
				userWithCount,
			] as any);
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

			const result = await service.getUsers({ page: 1, limit: 20 });

			expect(result.users[0].totalGames).toBe(5);
			expect(result.pagination).toEqual({
				total: 1,
				page: 1,
				limit: 20,
				totalPages: 1,
			});
		});

		it('should filter by search when provided', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([
				userWithCount,
			] as any);
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

			await service.getUsers({ page: 1, limit: 20, search: 'admin' });

			expect(prismaService.user.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ OR: expect.any(Array) }),
				}),
			);
		});

		it('should return all users when no search provided', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([
				userWithCount,
			] as any);
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

			await service.getUsers({ page: 1, limit: 20 });

			expect(prismaService.user.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ where: {} }),
			);
		});

		it('should use default page and limit when not provided', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([
				userWithCount,
			] as any);
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

			const result = await service.getUsers({});

			expect(result.pagination.page).toBe(1);
			expect(result.pagination.limit).toBe(20);
		});
	});

	describe('getGames', () => {
		it('should return paginated games', async () => {
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue([
				gameWithPlayers,
			] as any);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(1);

			const result = await service.getGames({ page: 1, limit: 20 });

			expect(result.games).toHaveLength(1);
			expect(result.games[0].whiteUsername).toBe('user1');
			expect(result.pagination.total).toBe(1);
		});

		it('should filter by status when provided', async () => {
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue(
				[] as any,
			);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(0);

			await service.getGames({ status: GameStatus.FINISHED });

			expect(prismaService.game.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { status: GameStatus.FINISHED },
				}),
			);
		});

		it('should use default page and limit when not provided', async () => {
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue(
				[] as any,
			);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(0);

			const result = await service.getGames({});

			expect(result.pagination.page).toBe(1);
			expect(result.pagination.limit).toBe(20);
		});
	});

	describe('deleteGame', () => {
		it('should delete a game by id', async () => {
			jest.spyOn(prismaService.game, 'delete').mockResolvedValue(
				gameFixture as any,
			);

			await expect(
				service.deleteGame(gameFixture.id),
			).resolves.toBeUndefined();
			expect(prismaService.game.delete).toHaveBeenCalledWith({
				where: { id: gameFixture.id },
			});
		});

		it('should throw NotFoundException when game not found', async () => {
			jest.spyOn(prismaService.game, 'delete').mockRejectedValue(
				prismaNotFoundException,
			);

			await expect(service.deleteGame('invalid-id')).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should return all users when no search provided', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([
				userWithCount,
			] as any);
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

			await service.getUsers({ page: 1, limit: 20 });

			expect(prismaService.user.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ where: {} }),
			);
		});

		it('should use default page and limit when not provided', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([
				userWithCount,
			] as any);
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

			const result = await service.getUsers({});

			expect(result.pagination.page).toBe(1);
			expect(result.pagination.limit).toBe(20);
		});
	});

	describe('getStats', () => {
		it('should return stats with game counts and top players', async () => {
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(10);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(5);
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(
				usersFixture as any,
			);
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue([
				gameWithPlayers,
			] as any);

			const result = await service.getStats();

			expect(result.stats.totalUsers).toBe(10);
			expect(result.stats.newUsersWeek).toBe(10);
			expect(result.stats.totalGames).toBe(0);
			expect(result.topPlayers).toEqual(usersFixture);
			expect(result.recentActivity).toEqual([]);
		});
	});

	describe('getGames', () => {
		it('should return paginated games', async () => {
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue([
				gameWithPlayers,
			] as any);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(1);

			const result = await service.getGames({ page: 1, limit: 20 });

			expect(result.games).toHaveLength(1);
			expect(result.games[0].whiteUsername).toBe('user1');
			expect(result.pagination.total).toBe(1);
		});

		it('should filter by status when provided', async () => {
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue(
				[] as any,
			);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(0);

			await service.getGames({ status: GameStatus.FINISHED });

			expect(prismaService.game.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { status: GameStatus.FINISHED },
				}),
			);
		});

		it('should use default page and limit when not provided', async () => {
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue(
				[] as any,
			);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(0);

			const result = await service.getGames({});

			expect(result.pagination.page).toBe(1);
			expect(result.pagination.limit).toBe(20);
		});
	});

	describe('deleteGame', () => {
		it('should delete a game by id', async () => {
			jest.spyOn(prismaService.game, 'delete').mockResolvedValue(
				gameFixture as any,
			);

			await expect(
				service.deleteGame(gameFixture.id),
			).resolves.toBeUndefined();
			expect(prismaService.game.delete).toHaveBeenCalledWith({
				where: { id: gameFixture.id },
			});
		});

		it('should throw NotFoundException when game not found', async () => {
			jest.spyOn(prismaService.game, 'delete').mockRejectedValue(
				prismaNotFoundException,
			);

			await expect(service.deleteGame('invalid-id')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('getStats', () => {
		it('should return stats with game counts and top players', async () => {
			jest.spyOn(prismaService.user, 'count').mockResolvedValue(10);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(5);
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(
				usersFixture as any,
			);
			jest.spyOn(prismaService.game, 'findMany').mockResolvedValue([
				gameWithPlayers,
			] as any);

			const result = await service.getStats();

			expect(result.stats.totalUsers).toBe(10);
			expect(result.stats.totalGames).toBe(5);
			expect(result.topPlayers).toEqual(usersFixture);
			expect(result.recentActivity).toHaveLength(1);
		});
	});
});
