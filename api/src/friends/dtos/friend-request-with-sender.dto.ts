import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '../../common/constants';

export class FriendRequestWithSenderDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	@ApiProperty({ example: EXAMPLES.id2 })
	senderId: string;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;

	@ApiProperty({ example: EXAMPLES.username })
	username: string;

	@ApiProperty({ example: EXAMPLES.elo })
	elo: number;

	@ApiProperty({ example: EXAMPLES.avatarUrl })
	avatarUrl: string | null;

	@ApiProperty({ example: EXAMPLES.isOnline })
	isOnline: boolean;

	@ApiProperty({ example: EXAMPLES.lastSeen })
	lastSeen: Date | null;
}
