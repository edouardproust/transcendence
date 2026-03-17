import { AdminService } from './admin.service';

export const AdminServiceMock = {
	provide: AdminService,
	useValue: {
		getUsers: jest.fn(),
		getGames: jest.fn(),
		deleteGame: jest.fn(),
		getStats: jest.fn(),
	},
};
