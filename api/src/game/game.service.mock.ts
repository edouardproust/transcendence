import { GameService } from './game.service';

export const gameFixture = {
	id: 1,
	whiteId: 1,
	blackId: 2,
	currentFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
	movesPGN: '1. e4',
	ongoing: true,
	result: null,
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
