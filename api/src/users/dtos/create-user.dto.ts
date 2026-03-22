import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';
import { CONSTRAINTS, EXAMPLES } from '../../common/constants';

export class CreateUserDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({ example: EXAMPLES.email })
	readonly email: string;

	@IsString()
	@MinLength(CONSTRAINTS.user.password.minLength)
	@MaxLength(CONSTRAINTS.user.password.maxLength)
	@Matches(CONSTRAINTS.user.password.regex, {
		message: CONSTRAINTS.user.password.message.regex,
	})
	@ApiProperty({ example: EXAMPLES.password })
	readonly password: string;

	@IsString()
	@MinLength(CONSTRAINTS.user.username.minLength)
	@MaxLength(CONSTRAINTS.user.username.maxLength)
	@Matches(CONSTRAINTS.user.username.regex, {
		message: CONSTRAINTS.user.username.message.regex,
	})
	@ApiProperty({ example: EXAMPLES.username })
	readonly username: string;
}
