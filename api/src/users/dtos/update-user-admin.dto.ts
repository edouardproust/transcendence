import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Role } from '../../prisma/generated/enums';
import { EXAMPLES } from '../../common/constants';

export class UpdateUserAdminDto {
	@ApiPropertyOptional({ example: EXAMPLES.elo })
	@IsOptional()
	@IsInt()
	@Min(0)
	elo?: number;

	@ApiPropertyOptional({ example: EXAMPLES.role, enum: Role })
	@IsOptional()
	@IsEnum(Role)
	role?: Role;
}
