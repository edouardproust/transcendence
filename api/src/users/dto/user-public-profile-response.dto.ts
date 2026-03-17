import { ApiProperty } from '@nestjs/swagger';
import { UserPublicResponseDto } from './user-public-response.dto';

export class UserPublicProfileResponseDto extends UserPublicResponseDto {
	@ApiProperty({ example: 10 })
	totalGames: number;

	@ApiProperty({ example: 6 })
	wins: number;

	@ApiProperty({ example: 3 })
	losses: number;

	@ApiProperty({ example: 1 })
	draws: number;
}
