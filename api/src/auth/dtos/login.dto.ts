import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { EXAMPLES } from '../../common/constants';

export class LoginDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		oneOf: [
			{ type: 'string', format: 'email', example: EXAMPLES.user.email },
			{ type: 'string', example: EXAMPLES.user.username },
		],
		description: 'Email or username',
	})
	readonly emailOrUsername: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: EXAMPLES.user.password })
	readonly password: string;
}
