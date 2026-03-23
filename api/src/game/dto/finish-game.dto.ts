import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FinishGameDto {
	@IsOptional()
	@IsString()
	winnerId: string | null;

	@IsString()
	@IsNotEmpty()
	currentFen: string;

	@IsString()
	@IsNotEmpty()
	pgn: string;
}
