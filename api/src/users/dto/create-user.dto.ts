import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({ example: 'user@example.com' })
	readonly email: string;

	@IsString()
	@MinLength(8)
	@ApiProperty({ example: 'password123' })
	readonly password: string;

	@IsString()
	@IsOptional()
	@MinLength(3)
	@ApiProperty({ example: 'john_doe', required: false })
	readonly username?: string;
}
