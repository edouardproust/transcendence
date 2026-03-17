import { ApiProperty } from '@nestjs/swagger';

export class UserPublicResponseDto {
	@ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
	id: string;

	@ApiProperty({ example: 'john' })
	username: string;

	@ApiProperty({ example: 1200 })
	elo: number;

	@ApiProperty({ example: 'user', enum: ['user', 'admin'] })
	role: string;

	@ApiProperty({ example: '/uploads/avatars/default.svg' })
	avatarUrl: string | null;

	@ApiProperty({ example: false })
	isOnline: boolean;

	@ApiProperty({ example: null, nullable: true })
	lastSeen: Date | null;

	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;
}
