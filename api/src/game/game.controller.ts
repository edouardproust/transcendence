import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('games')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	async createGame(@Body() dto: CreateGameDto) {
		return this.gameService.createGame(dto);
	}

	@Get(':id')
	async getGame(@Param('id', ParseIntPipe) id: number) {
		return this.gameService.getGame(id);
	}
}
