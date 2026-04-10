import { GameMode, GameStatus } from '../prisma/generated/enums';
import { GameService } from './game.service';
import { EXAMPLES } from '../common/constants';

export const gameFixture = {
	id: EXAMPLES.gameId,
	status: GameStatus.WAITING,
	mode: GameMode.ONLINE,
	whiteId: EXAMPLES.id,
	blackId: null,
	drawOfferedBy: null,
	winnerId: null,
	creatorUsername: EXAMPLES.username,
	creatorElo: EXAMPLES.elo,
	white: {
		username: EXAMPLES.username,
		elo: EXAMPLES.elo,
	},
	currentFen: EXAMPLES.initialFen,
	pgn: '',
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
	whiteTimeLeft: 600,
	blackTimeLeft: 600,
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
		cancelGame: jest.fn(),
		resignGame: jest.fn(),
		handlePlayerDisconnect: jest.fn(),
		makeMove: jest.fn(),
		decrementTime: jest.fn(),
	},
};
