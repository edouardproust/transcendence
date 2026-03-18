import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '../../common/constants';

export class AdminRecentActivityDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	// TODO: Remove:
	@ApiProperty({
		example: 'waiting',
		enum: ['waiting', 'active', 'finished', 'cancelled'],
	})
	// TOSO: Replace by this:
	//@ApiProperty({ example: GameStatus.waiting, enum: Object.values(GameStatus) })
	status: string;

	// TODO: Remove:
	@ApiProperty({ example: 'online', enum: ['online', 'ai'] })
	// TODO: Replace by this:
	//@ApiProperty({ example: GameMode.online, enum: Object.values(GameMode) })
	mode: string;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;

	@ApiProperty({ example: EXAMPLES.username })
	whiteUsername: string;

	@ApiProperty({ example: EXAMPLES.username2 })
	blackUsername: string | null;

	@ApiProperty({ example: EXAMPLES.username })
	winnerUsername: string | null;
}
