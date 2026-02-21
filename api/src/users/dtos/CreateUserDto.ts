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
	readonly email: string;

	@IsString()
	@MinLength(8)
	readonly password: string;

	@IsString()
	@IsOptional()
	@MinLength(3)
	readonly username?: string;
}
