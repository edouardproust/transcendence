import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { EXAMPLES } from '../../common/constants';
import { Role } from '../../prisma/generated/enums';

export class AdminUserDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	@ApiProperty({ example: EXAMPLES.username })
	username: string;

	@ApiProperty({ example: EXAMPLES.email })
	email: string;

	@ApiProperty({ example: EXAMPLES.elo })
	elo: number;

	@ApiProperty({ example: EXAMPLES.role, enum: Object.values(Role) })
	role: string;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;

	@ApiProperty({ example: EXAMPLES.totalGames })
	totalGames: number;
}

export class AdminUsersResponseDto {
	@ApiProperty({ type: [AdminUserDto] })
	users: AdminUserDto[];

	@ApiProperty({ type: PaginationDto })
	pagination: PaginationDto;
}
