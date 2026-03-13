import { Type } from 'class-transformer';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateGameDto {
	@Type(() => Number)
	@IsInt()
	whiteId: number;

	@Type(() => Number)
	@IsInt()
	blackId: number;
}

export class MakeMoveDto {
	@IsString()
	@IsNotEmpty()
	move: string;
}
