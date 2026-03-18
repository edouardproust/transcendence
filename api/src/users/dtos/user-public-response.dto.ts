import { ApiProperty } from '@nestjs/swagger';
import { ENUMS, EXAMPLES } from '../../common/constants';

export class UserPublicResponseDto {
	@ApiProperty({ example: EXAMPLES.user.id })
	id: string;

	@ApiProperty({ example: EXAMPLES.user.username })
	username: string;

	@ApiProperty({ example: EXAMPLES.user.elo })
	elo: number;

	@ApiProperty({ example: EXAMPLES.user.role, enum: ENUMS.roles })
	role: string;

	@ApiProperty({ example: EXAMPLES.user.avatarUrl })
	avatarUrl: string | null;

	@ApiProperty({ example: EXAMPLES.user.isOnline })
	isOnline: boolean;

	@ApiProperty({ example: EXAMPLES.user.lastSeen, nullable: true })
	lastSeen: Date | null;

	@ApiProperty({ example: EXAMPLES.date })
	createdAt: Date;
}
