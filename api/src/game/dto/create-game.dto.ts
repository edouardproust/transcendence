import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { EXAMPLES } from '../../common/constants';

export class CreateGameDto {
	@ApiProperty({
		example: EXAMPLES.timeControl,
		description: 'Time control (e.g. "10+0", "5+3", "unlimited")',
	})
	@IsString()
	@IsNotEmpty()
	timeControl: string; // ex: "10+0", "5+3", "unlimited"

	@ApiProperty({ enum: ['ONLINE', 'AI'], example: 'ONLINE' })
	@IsString()
	@IsIn(['ONLINE', 'AI'])
	mode: 'ONLINE' | 'AI';
}
