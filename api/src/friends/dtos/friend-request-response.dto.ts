import { ApiProperty } from '@nestjs/swagger';

export class FriendRequestResponseDto {
	@ApiProperty({ example: 'uuid' })
	id: string;

	@ApiProperty({ example: 'uuid' })
	senderId: string;

	@ApiProperty({ example: 'uuid' })
	receiverId: string;

	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;
}
