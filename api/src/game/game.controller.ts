import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('games')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	createGame(@Body() dto: CreateGameDto) {
		return this.gameService.createGame(dto);
	}

	@Get(':id')
	getGame(id: number) {
		return this.gameService.getGame(id);
	}
}
