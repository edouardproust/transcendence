import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGamesQueryDto } from './dtos/admin-games-query.dto';
import { AdminGamesResponseDto } from './dtos/admin-games-response.dto';
import { AdminStatsResponseDto } from './dtos/admin-stats-response.dto';
import { AdminUsersResponseDto } from './dtos/admin-users-response.dto';
import { isPrismaError, PrismaErrorCode } from '../prisma/prisma.error';
import { GameStatus } from '../prisma/generated/enums';
import { Prisma } from '../prisma/generated/client';
import { DEFAULTS } from '../common/constants';

@Injectable()
export class AdminService {
	constructor(private readonly prismaService: PrismaService) {}

	private mapGame(game: any) {
		return {
			id: game.id,
			status: game.status,
			mode: game.mode,
			timeControl: game.timeControl,
			createdAt: game.createdAt,
			updatedAt: game.updatedAt,
			whiteUsername: game.white?.username ?? 'Desconocido',
			blackUsername: game.black?.username ?? null,
			winnerUsername: game.winner?.username ?? null,
		};
	}

	/**
	 * Get a paginated and searchable list of users for the admin panel.
	 *
	 * @param query Pagination and search parameters
	 * @param query.page Page number (default: 1)
	 * @param query.limit Number of users per page (default: 20)
	 * @param query.search Optional search string matched against username and email (case-insensitive)
	 * @returns Paginated list of users with total game count, and pagination metadata.
	 */
	async getUsers(query: AdminUsersQueryDto): Promise<AdminUsersResponseDto> {
		const {
			page = DEFAULTS.pagination.page,
			limit = DEFAULTS.pagination.limit,
			search,
			sortBy = 'createdAt',
			sortOrder = 'desc',
		} = query;
		const skip = (page - 1) * limit;
		const userOrderBy = {
			[sortBy]: sortOrder,
		} as Prisma.UserOrderByWithRelationInput;

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
				orderBy: userOrderBy,
				include: {
					_count: {
						select: {
							whiteGames: true,
							blackGames: true,
						},
					},
				},
			}),
			this.prismaService.user.count({ where }),
		]);

		return {
			users: users.map((user) => {
				const { _count, ...rest } = user;
				return {
					...rest,
					totalGames: _count.blackGames + _count.whiteGames,
				};
			}),
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
		const {
			page = DEFAULTS.pagination.page,
			limit = DEFAULTS.pagination.limit,
			status,
			sortBy = 'createdAt',
			sortOrder = 'desc',
		} = query;
		const skip = (page - 1) * limit;
		const gameOrderBy = {
			[sortBy]: sortOrder,
		} as Prisma.GameOrderByWithRelationInput;

		const where = status ? { status: status as GameStatus } : {};

		// Run both queries in parallel for better performance
		const [games, total] = await Promise.all([
			this.prismaService.game.findMany({
				where,
				skip,
				take: limit,
				orderBy: gameOrderBy,
				include: {
					white: { select: { username: true } },
					black: { select: { username: true } },
					winner: { select: { username: true } },
				},
			}),
			this.prismaService.game.count({ where }),
		]);

		return {
			games: games.map((game) => this.mapGame(game)),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
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
		await this.prismaService.game
			.delete({ where: { id } })
			.catch((error) => {
				if (isPrismaError(error, PrismaErrorCode.NOT_FOUND)) {
					throw new NotFoundException('Game not found');
				}
				throw error;
			});
	}

	/**
	 * Get admin dashboard statistics.
	 *
	 * @returns Dashboard stats, top players by ELO, and recent game activity.
	 */
	async getStats(): Promise<AdminStatsResponseDto> {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		const oneDayAgo = new Date();
		oneDayAgo.setDate(oneDayAgo.getDate() - 1);

		const [
			totalUsers,
			newUsersWeek,
			totalGames,
			activeGames,
			finishedGames,
			gamesLast24h,
		] = await Promise.all([
			this.prismaService.user.count(),
			this.prismaService.user.count({
				where: { createdAt: { gte: oneWeekAgo } },
			}),
			this.prismaService.game.count(),
			this.prismaService.game.count({
				where: { status: GameStatus.ONGOING },
			}),
			this.prismaService.game.count({
				where: { status: GameStatus.FINISHED },
			}),
			this.prismaService.game.count({
				where: { createdAt: { gte: oneDayAgo } },
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

		const recentGames = await this.prismaService.game.findMany({
			where: { status: GameStatus.FINISHED },
			orderBy: { updatedAt: 'desc' },
			take: 10,
			include: {
				white: { select: { username: true } },
				black: { select: { username: true } },
				winner: { select: { username: true } },
			},
		});

		return {
			stats: {
				totalUsers,
				totalGames,
				activeGames,
				finishedGames,
				gamesLast24h,
				newUsersWeek,
			},
			topPlayers,
			recentActivity: recentGames.map((game) => this.mapGame(game)),
		};
	}
}
