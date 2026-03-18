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
import {
	CreateGameDto,
	MakeMoveDto,
	FinishGameDto,
} from './dto/create-game.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('games')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	// POST /games
	@Post()
	@UseGuards(JwtAuthGuard)
	async createGame(@Body() dto: CreateGameDto, @Req() req) {
		return this.gameService.createGame(dto, req.user.id);
	}

	// GET /games/active — doit être AVANT /:id pour ne pas être capturé par ParseIntPipe
	@Get('active')
	@UseGuards(JwtAuthGuard)
	async getActiveGames() {
		return this.gameService.getActiveGames();
	}

	// GET /games/user — idem, avant /:id
	@Get('user')
	@UseGuards(JwtAuthGuard)
	async getUserGames(@Req() req) {
		return this.gameService.getUserGames(req.user.id);
	}

	// GET /games/:id
	@Get(':id')
	@UseGuards(JwtAuthGuard)
	async getGame(@Param('id', ParseIntPipe) id: number) {
		return this.gameService.getGame(id);
	}

	// POST /games/:id/start
	@Post(':id/start')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async startGame(@Param('id', ParseIntPipe) id: number, @Req() req) {
		return this.gameService.startGame(id, req.user.id);
	}

	// POST /games/:id/finish
	@Post(':id/finish')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async finishGame(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: FinishGameDto,
		@Req() req,
	) {
		return this.gameService.finishGame(id, dto, req.user.id);
	}

	// POST /games/:id/move
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
