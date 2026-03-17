import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

// TODO: check for duplication with GamesQueryDto once games module is implemented
export class AdminGamesQueryDto {
	@ApiPropertyOptional({ example: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ example: 20 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 20;

	@ApiPropertyOptional({
		example: 'active',
		enum: ['waiting', 'active', 'finished', 'cancelled'],
	})
	@IsOptional()
	@IsEnum(['waiting', 'active', 'finished', 'cancelled'])
	status?: string;
}
