import { ApiProperty } from '@nestjs/swagger';

export class AdminRecentActivityDto {
	@ApiProperty({ example: 'uuid' })
	id: string;

	@ApiProperty({
		example: 'waiting',
		enum: ['waiting', 'active', 'finished', 'cancelled'],
	})
	status: string;

	@ApiProperty({ example: 'online', enum: ['online', 'ai'] })
	mode: string;

	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;

	@ApiProperty({ example: 'john' })
	whiteUsername: string;

	@ApiProperty({ example: 'jane', nullable: true })
	blackUsername: string | null;

	@ApiProperty({ example: 'john', nullable: true })
	winnerUsername: string | null;
}
