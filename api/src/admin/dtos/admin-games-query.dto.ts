import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
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

	@ApiPropertyOptional({
		example: GameStatus.WAITING,
		enum: Object.values(GameStatus),
	})
	@IsOptional()
	@IsEnum(GameStatus)
	status?: string;
}
