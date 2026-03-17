import { ApiProperty } from '@nestjs/swagger';
import { UserPublicProfileResponseDto } from './user-public-profile-response.dto';

export class UserProfileResponseDto extends UserPublicProfileResponseDto {
	@ApiProperty({ example: 'john@example.com' })
	email: string;
}
