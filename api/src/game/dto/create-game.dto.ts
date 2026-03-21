import { IsString, IsNotEmpty, IsIn, IsOptional, IsInt } from 'class-validator';

// POST /games
export class CreateGameDto {
	@IsString()
	@IsNotEmpty()
	timeControl: string; // ex: "10+0", "5+3", "unlimited"

	@IsString()
	@IsIn(['online', 'ai'])
	mode: 'online' | 'ai';
}

// POST /games/:id/move
export class MakeMoveDto {
	@IsString()
	@IsNotEmpty()
	move: string;
}

// POST /games/:id/finish
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
