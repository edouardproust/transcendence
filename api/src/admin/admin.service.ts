import { Injectable } from '@nestjs/common';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGamesQueryDto } from './dtos/admin-games-query.dto';
import { AdminGamesResponseDto } from './dtos/admin-games-response.dto';
import { AdminStatsResponseDto } from './dtos/admin-stats-response.dto';
import { AdminUsersResponseDto } from './dtos/admin-users-response.dto';

@Injectable()
export class AdminService {
	constructor(private readonly prismaService: PrismaService) {}

	/**
	 * Get a paginated and searchable list of users for the admin panel.
	 *
	 * @param query Pagination and search parameters
	 * @param query.page Page number (default: 1)
	 * @param query.limit Number of users per page (default: 20)
	 * @param query.search Optional search string matched against username and email (case-insensitive)
	 * @returns Paginated list of users with total game count, and pagination metadata.
	 *
	 * @remarks
	 * totalGames is mocked to 0 until the games module is implemented.
	 */
	async getUsers(query: AdminUsersQueryDto): Promise<AdminUsersResponseDto> {
		const { page = 1, limit = 20, search } = query;
		const skip = (page - 1) * limit;

		const where = search
			? {
					OR: [
						{
							username: {
								contains: search,
								mode: 'insensitive' as const,
							},
						},
						{
							email: {
								contains: search,
								mode: 'insensitive' as const,
							},
						},
					],
				}
			: {};

		// Run both queries in parallel with `Promise.all()` for better performance
		const [users, total] = await Promise.all([
			this.prismaService.user.findMany({
				where,
				skip,
				take: limit,
				omit: { password: true },
				orderBy: { createdAt: 'desc' },
			}),
			this.prismaService.user.count({ where }),
		]);

		return {
			users: users.map((user) => ({
				...user,
				totalGames: 0, // TODO: replace when games module is ready
			})),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get a paginated and filterable list of games for the admin panel.
	 *
	 * @param query Pagination and filter parameters
	 * @param query.page Page number (default: 1)
	 * @param query.limit Number of games per page (default: 20)
	 * @param query.status Optional filter by game status
	 * @returns Paginated list of games with player usernames, and pagination metadata.
	 */
	async getGames(query: AdminGamesQueryDto): Promise<AdminGamesResponseDto> {
		const { page = 1, limit = 20, status } = query;
		const skip = (page - 1) * limit;

		const where = status ? { status } : {};

		// TODO: implement when games module is ready
		/*
		// Run both queries in parallel for better performance
		const [games, total] = await Promise.all([
			this.prismaService.game.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
				include: {
					whitePlayer: { select: { username: true } },
					blackPlayer: { select: { username: true } },
					winner: { select: { username: true } },
				},
			}),
			this.prismaService.game.count({ where }),
		]);

		return {
			games: games.map((game) => ({
				id: game.id,
				status: game.status,
				mode: game.mode,
				timeControl: game.timeControl,
				createdAt: game.createdAt,
				updatedAt: game.updatedAt,
				whiteUsername: game.whitePlayer.username,
				blackUsername: game.blackPlayer?.username ?? null,
				winnerUsername: game.winner?.username ?? null,
			})),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
		*/

		// TODO: Placeholder to remove
		return {
			games: [],
			pagination: {
				total: 0,
				page: query.page ?? 1,
				limit: query.limit ?? 20,
				totalPages: 0,
			},
		};
	}

	/**
	 * Delete a game by id.
	 *
	 * @param id Game id
	 * @throws {NotFoundException} If game not found
	 */
	async deleteGame(id: string): Promise<void> {
		// TODO: implement when games module is ready
		/*
		await this.prismaService.game.delete({ where: { id } })
		.catch((error) => {
			if (isPrismaError(error, PrismaErrorCode.NOT_FOUND)) {
			throw new NotFoundException('Game not found');
			}
			throw error;
		});
		*/
	}

	/**
	 * Get admin dashboard statistics.
	 *
	 * @returns Dashboard stats, top players by ELO, and recent game activity.
	 */
	async getStats(): Promise<AdminStatsResponseDto> {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		// Run both queries in parallel with `Promise.all()` for better performance
		const [totalUsers, newUsersWeek] = await Promise.all([
			this.prismaService.user.count(),
			this.prismaService.user.count({
				where: {
					createdAt: {
						gte: oneWeekAgo,
					},
				},
			}),
		]);

		const topPlayers = await this.prismaService.user.findMany({
			orderBy: { elo: 'desc' },
			take: 10,
			select: {
				id: true,
				username: true,
				email: true,
				elo: true,
				createdAt: true,
			},
		});

		return {
			stats: {
				totalUsers,
				totalGames: 0, // TODO: games module
				activeGames: 0, // TODO: games module
				finishedGames: 0, // TODO: games module
				gamesLast24h: 0, // TODO: games module
				newUsersWeek,
			},
			topPlayers,
			recentActivity: [], // TODO: games module
		};
	}
}
