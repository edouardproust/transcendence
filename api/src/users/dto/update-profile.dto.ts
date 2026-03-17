import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// users/dtos/update-profile.dto.ts
export class UpdateProfileDto {
	@ApiPropertyOptional({ example: 'john' })
	@IsOptional()
	@IsString()
	@MinLength(3)
	username?: string;

	@ApiPropertyOptional({ example: 'john@example.com' })
	@IsOptional()
	@IsEmail()
	email?: string;
}
