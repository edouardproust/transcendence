import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { distinct } from 'rxjs';

@Injectable()
export class GameService {
	createGame(dto: CreateGameDto) {
		if (dto.whiteId === dto.blackId) {
			throw new BadRequestException('Players must be different');
		}
		return {
			message: 'Game created',
			players: {
				white: dto.whiteId,
				black: dto.blackId,
			},
		};
	}
}
