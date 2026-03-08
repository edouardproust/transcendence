import { Body, Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';

@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@Post()
	createGame(@Body() dto: CreateGameDto) {
		return this.gameService.createGame(dto);
	}
}
