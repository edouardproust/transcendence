import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '../../common/constants';
import { Role } from '../../prisma/generated/enums';

export class UserPublicResponseDto {
	@ApiProperty({ example: EXAMPLES.id })
	id: string;

	@ApiProperty({ example: EXAMPLES.username })
	username: string;

	@ApiProperty({ example: EXAMPLES.elo })
	elo: number;

	@ApiProperty({ example: EXAMPLES.role, enum: Object.values(Role) })
	role: string;

	@ApiProperty({ example: EXAMPLES.avatarUrl })
	avatarUrl: string | null;

	@ApiProperty({ example: EXAMPLES.isOnline })
	isOnline: boolean;

	@ApiProperty({ example: EXAMPLES.lastSeen, nullable: true })
	lastSeen: Date | null;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;
}
