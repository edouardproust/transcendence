import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';
import { CONSTRAINTS, EXAMPLES } from '../../common/constants';

// users/dtos/update-profile.dto.ts
export class UpdateProfileDto {
	@ApiPropertyOptional({ example: EXAMPLES.username })
	@IsOptional()
	@IsString()
	@MinLength(CONSTRAINTS.user.username.minLength)
	@MaxLength(CONSTRAINTS.user.username.maxLength)
	@Matches(CONSTRAINTS.user.username.regex, {
		message: CONSTRAINTS.user.username.message.regex,
	})
	username?: string;

	@ApiPropertyOptional({ example: EXAMPLES.email })
	@IsOptional()
	@IsEmail()
	email?: string;
}
