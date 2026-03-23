import { GameMode, GameStatus } from '../prisma/generated/enums';
import { GameService } from './game.service';
import { EXAMPLES } from '../common/constants';

export const gameFixture = {
	id: EXAMPLES.gameId,
	status: GameStatus.WAITING,
	mode: GameMode.ONLINE,
	whiteId: EXAMPLES.id,
	blackId: null,
	winnerId: null,
	currentFen: null,
	pgn: null,
	timeControl: EXAMPLES.timeControl,
	createdAt: new Date(EXAMPLES.date),
	updatedAt: new Date(EXAMPLES.date),
};

export const ongoingGameFixture = {
	...gameFixture,
	status: GameStatus.ONGOING,
	blackId: EXAMPLES.id2,
	currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
	pgn: '',
};

export const GameServiceMock = {
	provide: GameService,
	useValue: {
		createGame: jest.fn(),
		getGame: jest.fn(),
		getActiveGames: jest.fn(),
		getUserGames: jest.fn(),
		startGame: jest.fn(),
		finishGame: jest.fn(),
		makeMove: jest.fn(),
	},
};
