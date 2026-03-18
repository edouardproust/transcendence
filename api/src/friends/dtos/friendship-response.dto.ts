import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '../../common/constants';

export class FriendshipResponseDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	@ApiProperty({ example: EXAMPLES.id2 })
	userId: string;

	@ApiProperty({ example: EXAMPLES.id3 })
	friendId: string;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;
}
