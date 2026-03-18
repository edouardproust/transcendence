import { ApiProperty } from '@nestjs/swagger';
import { AdminRecentActivityDto } from './admin-recent-activity.dto';
import { EXAMPLES } from '../../common/constants';

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
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	@ApiProperty({ example: EXAMPLES.username })
	username: string;

	@ApiProperty({ example: EXAMPLES.email })
	email: string;

	@ApiProperty({ example: EXAMPLES.elo })
	elo: number;

	@ApiProperty({ example: EXAMPLES.date })
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
