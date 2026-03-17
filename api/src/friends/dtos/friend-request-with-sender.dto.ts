import { ApiProperty } from '@nestjs/swagger';

export class FriendRequestWithSenderDto {
	@ApiProperty({ example: 'uuid' })
	id: string;

	@ApiProperty({ example: 'uuid' })
	senderId: string;

	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;

	@ApiProperty({ example: 'john' })
	username: string;

	@ApiProperty({ example: 1200 })
	elo: number;

	@ApiProperty({ example: '/uploads/avatars/default.svg' })
	avatarUrl: string | null;

	@ApiProperty({ example: false })
	isOnline: boolean;

	@ApiProperty({ example: null, nullable: true })
	lastSeen: Date | null;
}
