import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Role } from '../../prisma/generated/enums';

export class UpdateUserAdminDto {
	@ApiPropertyOptional({ example: 1400 })
	@IsOptional()
	@IsInt()
	@Min(0)
	elo?: number;

	@ApiPropertyOptional({ example: 'user', enum: Role })
	@IsOptional()
	@IsEnum(Role)
	role?: Role;
}
