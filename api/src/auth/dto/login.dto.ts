import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		oneOf: [
			{ type: 'string', format: 'email', example: 'user@example.com' },
			{ type: 'string', example: 'john_doe' },
		],
		description: 'Email or username',
	})
	readonly emailOrUsername: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'password123' })
	readonly password: string;
}
