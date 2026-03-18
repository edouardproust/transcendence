import { ApiProperty } from '@nestjs/swagger';
import { UserPublicResponseDto } from './user-public-response.dto';
import { EXAMPLES } from '../../common/constants';

export class UserPublicProfileResponseDto extends UserPublicResponseDto {
	@ApiProperty({ example: EXAMPLES.totalGames })
	totalGames: number;

	@ApiProperty({ example: EXAMPLES.wins })
	wins: number;

	@ApiProperty({ example: EXAMPLES.losses })
	losses: number;

	@ApiProperty({ example: EXAMPLES.draws })
	draws: number;
}
