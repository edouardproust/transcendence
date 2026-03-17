import { Injectable } from '@nestjs/common';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../prisma/generated/client';

@Injectable()
export class AdminService {
	constructor(private readonly prismaService: PrismaService) {}

	async findManyPaginated(query: AdminUsersQueryDto) {
		const { page = 1, limit = 20, search } = query;
		const skip = (page - 1) * limit;

		const where = search
			? {
					OR: [
						{
							username: {
								contains: search,
								mode: Prisma.QueryMode.insensitive,
							},
						},
						{
							email: {
								contains: search,
								mode: Prisma.QueryMode.insensitive,
							},
						},
					],
				}
			: {};

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
}
