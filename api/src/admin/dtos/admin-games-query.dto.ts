import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { DEFAULTS } from '../../common/constants';
import { GameStatus } from '../../prisma/generated/enums';

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
		example: GameStatus.WAITING,
		enum: Object.values(GameStatus),
	})
	// TODO: replace by this:
	//@ApiPropertyOptional({ example: GameStatus.active, enum: Object.values(GameStatus)})
	@IsOptional()
	@IsEnum(GameStatus)
	status?: string;

	@ApiPropertyOptional({
		example: 'createdAt',
		enum: ['createdAt', 'updatedAt', 'status', 'mode', 'timeControl'],
	})
	@IsOptional()
	@IsIn(['createdAt', 'updatedAt', 'status', 'mode', 'timeControl'])
	sortBy?:
		| 'createdAt'
		| 'updatedAt'
		| 'status'
		| 'mode'
		| 'timeControl' = 'createdAt';

	@ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
	@IsOptional()
	@IsIn(['asc', 'desc'])
	sortOrder?: 'asc' | 'desc' = 'desc';
}
