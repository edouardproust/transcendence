import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class AdminUsersQueryDto {
	@ApiPropertyOptional({ example: 1 })
	@IsOptional()
	@Type(() => Number) // transform query string to int before @IsInt()
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ example: 20 })
	@IsOptional()
	@Type(() => Number) // idem
	@IsInt()
	@Min(1)
	limit?: number = 20;

	@ApiPropertyOptional({ example: 'john' })
	@IsOptional()
	@IsString()
	@MinLength(2)
	search?: string;
}
