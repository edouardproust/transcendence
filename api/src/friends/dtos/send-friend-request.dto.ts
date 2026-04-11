import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { EXAMPLES } from '../../common/constants';

export class SendFriendRequestDto {
	@ApiProperty({ example: EXAMPLES.id })
	@IsUUID()
	receiverId: string;
}
