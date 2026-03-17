import { ApiProperty } from '@nestjs/swagger';

export class FriendshipResponseDto {
	@ApiProperty({ example: 'uuid' })
	id: string;

	@ApiProperty({ example: 'uuid' })
	userId: string;

	@ApiProperty({ example: 'uuid' })
	friendId: string;

	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;
}
