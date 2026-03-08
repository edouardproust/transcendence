import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateGameDto {
	@Type(() => Number)
	@IsInt()
	whiteId: number;

	@Type(() => Number)
	@IsInt()
	blackId: number;
}
