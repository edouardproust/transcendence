import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { EXAMPLES } from '../../common/constants';

export class SearchUsersDto {
	@ApiProperty({ example: EXAMPLES.user.usernameSearch })
	@IsString()
	@MinLength(2)
	query: string;
}
