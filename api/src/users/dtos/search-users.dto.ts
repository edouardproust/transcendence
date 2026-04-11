import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { CONSTRAINTS, EXAMPLES } from '../../common/constants';

export class SearchUsersDto {
	@ApiProperty({ example: EXAMPLES.usernameSearch })
	@IsString()
	@MinLength(CONSTRAINTS.user.search.minLength)
	query: string;
}
