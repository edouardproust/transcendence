import { ApiProperty } from '@nestjs/swagger';
import { AdminRecentActivityDto } from './admin-recent-activity.dto';

export class AdminStatsDto {
	@ApiProperty({ example: 100 })
	totalUsers: number;

	@ApiProperty({ example: 50 })
	totalGames: number;

	@ApiProperty({ example: 5 })
	activeGames: number;

	@ApiProperty({ example: 40 })
	finishedGames: number;

	@ApiProperty({ example: 10 })
	gamesLast24h: number;

	@ApiProperty({ example: 8 })
	newUsersWeek: number;
}

export class AdminTopPlayerDto {
	@ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
	id: string;

	@ApiProperty({ example: 'john' })
	username: string;

	@ApiProperty({ example: 'john@example.com' })
	email: string;

	@ApiProperty({ example: 1400 })
	elo: number;

	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;
}

export class AdminStatsResponseDto {
	@ApiProperty({ type: AdminStatsDto })
	stats: AdminStatsDto;

	@ApiProperty({ type: [AdminTopPlayerDto] })
	topPlayers: AdminTopPlayerDto[];

	@ApiProperty({ type: [AdminRecentActivityDto] })
	recentActivity: AdminRecentActivityDto[];
}
