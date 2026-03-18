import { ApiProperty } from '@nestjs/swagger';
import { UserPublicProfileResponseDto } from './user-public-profile-response.dto';
import { EXAMPLES } from '../../common/constants';

export class UserProfileResponseDto extends UserPublicProfileResponseDto {
	@ApiProperty({ example: EXAMPLES.user.email })
	email: string;
}
