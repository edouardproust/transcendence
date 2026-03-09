import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';

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
		const game = await this.prisma.game.create({
			data: {
				whiteId: dto.whiteId,
				blackId: dto.blackId,
			},
		});

		return game;
	}
}
