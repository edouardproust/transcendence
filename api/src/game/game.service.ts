import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { distinct } from 'rxjs';

@Injectable()
export class GameService {
	createGame(dto: CreateGameDto) {
		return {
			message: 'Game created',
			players: {
				ehite: dto.whiteId,
				black: dto.blackId,
			},
		};
	}
}
