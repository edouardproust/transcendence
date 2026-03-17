import { ApiProperty } from '@nestjs/swagger';
import { UserPublicResponseDto } from './user-public-response.dto';

export class UserResponseDto extends UserPublicResponseDto {
	@ApiProperty({ example: 'john@example.com' })
	email: string;
}
