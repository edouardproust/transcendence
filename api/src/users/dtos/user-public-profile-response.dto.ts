import { ApiProperty } from '@nestjs/swagger';
import { UserPublicResponseDto } from './user-public-response.dto';
import { EXAMPLES } from '../../common/constants';

export class UserPublicProfileResponseDto extends UserPublicResponseDto {
	@ApiProperty({ example: EXAMPLES.user.totalGames })
	totalGames: number;

	@ApiProperty({ example: EXAMPLES.user.wins })
	wins: number;

	@ApiProperty({ example: EXAMPLES.user.losses })
	losses: number;

	@ApiProperty({ example: EXAMPLES.user.draws })
	draws: number;
}
