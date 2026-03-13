import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto, MakeMoveDto } from './dto/create-game.dto';
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

	@Post(':id/move')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async makeMove(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: MakeMoveDto,
		@Req() req,
	) {
		return this.gameService.makeMove(id, dto, req.user.id);
	}
}
