import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '../../common/constants';

export class FriendRequestResponseDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	@ApiProperty({ example: EXAMPLES.id2 })
	senderId: string;

	@ApiProperty({ example: EXAMPLES.id3 })
	receiverId: string;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;
}
