import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import {
	CreateGameDto,
	MakeMoveDto,
	FinishGameDto,
} from './dto/create-game.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('games')
@UseGuards(JwtAuthGuard)
@ApiTags('games')
@ApiBearerAuth()
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new game' })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'Game created' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	async createGame(
		@Body() dto: CreateGameDto,
		@CurrentUser() user: RequestUser,
	) {
		return this.gameService.createGame(dto, user.id);
	}

	@Get('active')
	@ApiOperation({ summary: 'Get active games available to join' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Returns active games' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	async getActiveGames() {
		return this.gameService.getActiveGames();
	}

	@Get('user')
	@ApiOperation({ summary: 'Get games for current user' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Returns user games' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	async getUserGames(@CurrentUser() user: RequestUser) {
		return this.gameService.getUserGames(user.id);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get game by id' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Returns game' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Game not found',
	})
	async getGame(@Param('id', ParseUUIDPipe) id: string) {
		return this.gameService.getGame(id);
	}

	@Post(':id/start')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Start a game' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Game started' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Game not found',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Not a player in this game',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Game cannot be started',
	})
	async startGame(
		@Param('id', ParseUUIDPipe) id: string,
		@CurrentUser() user: RequestUser,
	) {
		return this.gameService.startGame(id, user.id);
	}

	@Post(':id/finish')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Finish a game' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Game finished' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Game is not ongoing',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Game not found',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Not a player in this game',
	})
	async finishGame(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: FinishGameDto,
		@CurrentUser() user: RequestUser,
	) {
		return this.gameService.finishGame(id, dto, user.id);
	}

	@Post(':id/move')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Make a move in a game' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Move applied' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Game not found',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid or illegal move',
	})
	async makeMove(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: MakeMoveDto,
		@CurrentUser() user: RequestUser,
	) {
		return this.gameService.makeMove(id, dto, user.id);
	}
}
