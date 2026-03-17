import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
	token: string;

	@ApiProperty()
	user: UserResponseDto;
}
