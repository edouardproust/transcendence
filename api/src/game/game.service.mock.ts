import { GameService } from './game.service';

export const gameFixture = {
	id: '11111111-1111-1111-1111-111111111111',
	status: 'waiting',
	mode: 'online',
	white_player_id: 1,
	black_player_id: null,
	winner_id: null,
	current_fen: null,
	pgn: null,
	time_control: '10+0',
	created_at: new Date('2024-01-01T00:00:00.000Z'),
	updated_at: new Date('2024-01-01T00:00:00.000Z'),
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
