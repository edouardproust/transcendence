import { ApiProperty } from '@nestjs/swagger';
import { UserPublicResponseDto } from './user-public-response.dto';
import { EXAMPLES } from '../../common/constants';

export class UserResponseDto extends UserPublicResponseDto {
	@ApiProperty({ example: EXAMPLES.user.email })
	email: string;
}
