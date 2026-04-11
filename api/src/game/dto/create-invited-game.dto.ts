import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { EXAMPLES } from '../../common/constants';

export class CreateInvitedGameDto {
	@ApiProperty({
		example: EXAMPLES.id2,
		description: 'Friend id that will receive the invitation',
	})
	@IsUUID()
	friendId: string;

	@ApiProperty({
		example: EXAMPLES.timeControl,
		description: 'Time control for the invited online game',
	})
	@IsString()
	@IsNotEmpty()
	timeControl: string;
}
