import { IsNotEmpty, IsString } from 'class-validator';

export class MakeMoveDto {
	@IsString()
	@IsNotEmpty()
	move: string;
}
