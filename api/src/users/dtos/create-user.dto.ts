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
	@MinLength(CONSTRAINTS.password.minLength)
	@MaxLength(CONSTRAINTS.password.maxLength)
	@Matches(CONSTRAINTS.password.regex, {
		message: CONSTRAINTS.password.message.regex,
	})
	@ApiProperty({ example: EXAMPLES.password })
	readonly password: string;

	@IsString()
	@MinLength(CONSTRAINTS.username.minLength)
	@MaxLength(CONSTRAINTS.username.maxLength)
	@Matches(CONSTRAINTS.username.regex, {
		message: CONSTRAINTS.username.message.regex,
	})
	@ApiProperty({ example: EXAMPLES.username })
	readonly username: string;
}
