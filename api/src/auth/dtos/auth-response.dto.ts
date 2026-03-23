import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import { EXAMPLES } from '../../common/constants';

export class AuthResponseDto {
	@ApiProperty({ example: EXAMPLES.jwtToken })
	token: string;

	@ApiProperty()
	user: UserResponseDto;
}
