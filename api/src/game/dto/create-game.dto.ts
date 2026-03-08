import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateGameDto {
	@Type(() => Number)
	@IsInt()
	whiteId: string;

	@Type(() => Number)
	@IsInt()
	blackId: string;
}
