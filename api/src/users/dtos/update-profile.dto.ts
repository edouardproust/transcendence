import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { EXAMPLES } from '../../common/constants';

// users/dtos/update-profile.dto.ts
export class UpdateProfileDto {
	@ApiPropertyOptional({ example: EXAMPLES.user.username })
	@IsOptional()
	@IsString()
	@MinLength(3)
	username?: string;

	@ApiPropertyOptional({ example: EXAMPLES.user.email })
	@IsOptional()
	@IsEmail()
	email?: string;
}
