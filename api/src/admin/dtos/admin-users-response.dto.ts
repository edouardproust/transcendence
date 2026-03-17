import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

export class AdminUserDto {
	@ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
	id: string;

	@ApiProperty({ example: 'john' })
	username: string;

	@ApiProperty({ example: 'john@example.com' })
	email: string;

	@ApiProperty({ example: 1200 })
	elo: number;

	@ApiProperty({ example: 'user', enum: ['user', 'admin'] })
	role: string;

	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;

	@ApiProperty({ example: 12 })
	totalGames: number;
}

export class AdminUsersResponseDto {
	@ApiProperty({ type: [AdminUserDto] })
	users: AdminUserDto[];

	@ApiProperty({ type: PaginationDto })
	pagination: PaginationDto;
}
