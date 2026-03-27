import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EXAMPLES } from '../../common/constants';
import { GameMode, GameStatus } from '../../prisma/generated/enums';

export class GameResponseDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	@ApiProperty({
		example: GameStatus.WAITING,
		enum: Object.values(GameStatus),
	})
	status: GameStatus;

	@ApiProperty({ example: GameMode.ONLINE, enum: Object.values(GameMode) })
	mode: GameMode;

	@ApiProperty({ example: EXAMPLES.id })
	whiteId: string;

	@ApiPropertyOptional({ example: EXAMPLES.id2, nullable: true })
	blackId: string | null;

	@ApiPropertyOptional({ example: EXAMPLES.id2, nullable: true })
	winnerId: string | null;

	@ApiPropertyOptional({
		example: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		nullable: true,
	})
	currentFen: string | null;

	@ApiPropertyOptional({ example: '1. e4 e5', nullable: true })
	pgn: string | null;

	@ApiProperty({ example: EXAMPLES.timeControl })
	timeControl: string;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;

	@ApiProperty({ example: EXAMPLES.date })
	updatedAt: Date;
}
