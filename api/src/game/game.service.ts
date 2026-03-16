import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto, MakeMoveDto } from './dto/create-game.dto';
import { Chess } from 'chess.js';
import { GameMode, GameStatus, TimeControl } from '../prisma/generated/enums';

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	async createGame(dto: CreateGameDto) {
		if (dto.whiteId === dto.blackId) {
			throw new BadRequestException('Players must be different');
		}

		const white = await this.prisma.user.findUnique({
			where: { id: dto.whiteId },
		});

		const black = await this.prisma.user.findUnique({
			where: { id: dto.blackId },
		});

		if (!white || !black) {
			throw new NotFoundException('Player not found');
		}

		const chess = new Chess();

		const game = await this.prisma.game.create({
			data: {
				whiteId: dto.whiteId,
				blackId: dto.blackId,
				status: GameStatus.ONGOING,
				mode: GameMode.ONLINE,
				timeControl: TimeControl.UNLIMITED,
				currentFEN: chess.fen(),
				movesPGN: '',
			},
		});

		return game;
	}

	async getGame(id: number) {
		const game = await this.prisma.game.findUnique({
			where: { id },
		});

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		return game;
	}

	async makeMove(gameId: number, dto: MakeMoveDto, userId: number) {
		const game = await this.prisma.game.findUnique({
			where: { id: gameId },
		});

		if (!game) {
			throw new NotFoundException('Game not found');
		}

		if (game.status !== GameStatus.ONGOING) {
			throw new BadRequestException('Game is already over');
		}

		const chess = new Chess();

		if (game.movesPGN) {
			chess.loadPgn(game.movesPGN);
		} else {
			chess.load(game.currentFEN);
		}

		const isWhiteMove = chess.turn() === 'w';
		const expectedPlayerId = isWhiteMove ? game.whiteId : game.blackId;

		if (userId !== expectedPlayerId) {
			throw new BadRequestException('Not your turn');
		}

		let move;

		try {
			move = chess.move(dto.move);
		} catch {
			throw new BadRequestException('Illegal move');
		}

		if (!move) {
			throw new BadRequestException('Illegal move');
		}

		let status = GameStatus.ONGOING;

		if (
			chess.isCheckmate() ||
			chess.isDraw() ||
			chess.isStalemate() ||
			chess.isThreefoldRepetition() ||
			chess.isInsufficientMaterial()
		) {
			status = GameStatus.FINISHED;
		}

		const updatedGame = await this.prisma.game.update({
			where: {
				id: gameId,
				currentFEN: game.currentFEN, // Optimistic concurrency control
			},
			data: {
				currentFEN: chess.fen(),
				movesPGN: chess.pgn(),
				status,
			},
		});

		return updatedGame;
	}
}
