import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SearchUsersDto {
	@ApiProperty({ example: 'joh', minLength: 2 })
	@IsString()
	@MinLength(2)
	query: string;
}
