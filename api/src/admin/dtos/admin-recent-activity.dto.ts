import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '../../common/constants';
import { GameMode, GameStatus } from '../../prisma/generated/enums';

export class AdminRecentActivityDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	@ApiProperty({
		example: GameStatus.WAITING,
		enum: Object.values(GameStatus),
	})
	status: string;

	@ApiProperty({ example: GameMode.AI, enum: Object.values(GameMode) })
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
