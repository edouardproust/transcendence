import { IsString, IsNotEmpty, IsIn, IsOptional, IsInt } from 'class-validator';

export class CreateGameDto {
	@IsString()
	@IsNotEmpty()
	timeControl: string; // ex: "10+0", "5+3", "unlimited"

	@IsString()
	@IsIn(['ONLINE', 'AI'])
	mode: 'ONLINE' | 'AI';
}
