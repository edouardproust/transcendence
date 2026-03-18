import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { DEFAULTS } from '../../common/constants';
// TODO: uncomment once games module is implemented:
//import { GameStatus } from '../../prisma/generated/enums';

// TODO: check for duplication with GamesQueryDto once games module is implemented
export class AdminGamesQueryDto {
	@ApiPropertyOptional({ example: DEFAULTS.pagination.page })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = DEFAULTS.pagination.page;

	@ApiPropertyOptional({ example: DEFAULTS.pagination.limit })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = DEFAULTS.pagination.limit;

	// TODO: remove:
	@ApiPropertyOptional({
		example: 'active',
		enum: ['waiting', 'active', 'finished', 'cancelled'],
	})
	// TODO: replace by this:
	//@ApiPropertyOptional({ example: GameStatus.active, enum: Object.values(GameStatus)})
	@IsOptional()
	// TODO: remove:
	@IsEnum(['waiting', 'active', 'finished', 'cancelled'])
	// TODO replace by this:
	//@IsEnum(Object.values(GameStatus))
	status?: string;
}
