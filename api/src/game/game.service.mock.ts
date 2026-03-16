import { GameService } from './game.service';
import { GameStatus, GameMode, TimeControl } from '../prisma/generated/enums';

export const gameFixture = {
	id: 1,
	whiteId: 1,
	blackId: 2,
	status: GameStatus.ONGOING,
	mode: GameMode.ONLINE,
	timeControl: TimeControl.BLITZ,
	initialTime: 300,
	increment: 0,
	currentFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
	movesPGN: '1. e4',
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const GameServiceMock = {
	provide: GameService,
	useValue: {
		createGame: jest.fn(),
		getGame: jest.fn(),
		makeMove: jest.fn(),
	},
};
