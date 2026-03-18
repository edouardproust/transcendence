import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { EXAMPLES } from '../../common/constants';
// TODO: uncomment once games module is done:
//import { GameMode, GameStatus } from '../../prisma/generated/enums';

export class AdminGameDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	// TODO: remove:
	@ApiProperty({
		example: 'waiting',
		enum: ['waiting', 'active', 'finished', 'cancelled'],
	})
	// TODO: replace by this:
	//@ApiProperty({ example: GameStatus.waiting, enum: Object.values(GameStatus) })

	// TODO: remove:
	@ApiProperty({ example: 'online', enum: ['online', 'ai'] })
	// TODO: replace by this:
	//@ApiPropertyOptional({ example: GameMode.online, enum: Object.values(GameMode) })
	mode: string;

	@ApiProperty({ example: EXAMPLES.timeControl })
	timeControl: string;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;

	@ApiProperty({ example: EXAMPLES.date })
	updatedAt: Date;

	@ApiProperty({ example: EXAMPLES.username })
	whiteUsername: string;

	@ApiProperty({ example: EXAMPLES.username2 })
	blackUsername: string | null;

	@ApiProperty({ example: EXAMPLES.username })
	winnerUsername: string | null;
}

export class AdminGamesResponseDto {
	@ApiProperty({ type: [AdminGameDto] })
	games: AdminGameDto[];

	@ApiProperty({ type: PaginationDto })
	pagination: PaginationDto;
}
