import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({ example: 'user@example.com' })
	readonly email: string;

	@IsString()
	@MinLength(12)
	@MaxLength(128)
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>/?\\|[\]~`]).*$/,
		{
			message:
				'Password must contain uppercase, lowercase, a number and a special character',
		},
	)
	@ApiProperty({ example: 'Password123!' })
	readonly password: string;

	@IsString()
	@MinLength(3)
	@MaxLength(30)
	@Matches(/^[a-zA-Z0-9_-]+$/, {
		message:
			'Username can only contain letters, numbers, underscores and hyphens',
	})
	@ApiProperty({ example: 'john_doe' })
	readonly username: string;
}
