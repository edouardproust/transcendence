import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Min,
	MinLength,
} from 'class-validator';
import { DEFAULTS, EXAMPLES } from '../../common/constants';

export class AdminUsersQueryDto {
	@ApiPropertyOptional({ example: DEFAULTS.pagination.page })
	@IsOptional()
	@Type(() => Number) // transform query string to int before @IsInt()
	@IsInt()
	@Min(1)
	page?: number = DEFAULTS.pagination.page;

	@ApiPropertyOptional({ example: DEFAULTS.pagination.limit })
	@IsOptional()
	@Type(() => Number) // idem
	@IsInt()
	@Min(1)
	limit?: number = DEFAULTS.pagination.limit;

	@ApiPropertyOptional({ example: EXAMPLES.usernameSearch })
	@IsOptional()
	@IsString()
	@MinLength(2)
	search?: string;

	@ApiPropertyOptional({
		example: 'createdAt',
		enum: ['createdAt', 'username', 'email', 'elo', 'role'],
	})
	@IsOptional()
	@IsIn(['createdAt', 'username', 'email', 'elo', 'role'])
	sortBy?: 'createdAt' | 'username' | 'email' | 'elo' | 'role' =
		'createdAt';

	@ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
	@IsOptional()
	@IsIn(['asc', 'desc'])
	sortOrder?: 'asc' | 'desc' = 'desc';
}
