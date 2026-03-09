import { GameService } from './game.service';

export const gameFixture = {
	id: 1,
	whiteId: 1,
	blackId: 2,
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const GameServiceMock = {
	provide: GameService,
	useValue: {
		createGame: jest.fn(),
		getGame: jest.fn(),
	},
};
