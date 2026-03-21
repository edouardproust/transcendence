import { PrismaService } from './prisma.service';

export const PrismaServiceMock = {
	provide: PrismaService,
	useValue: {
		user: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
		game: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
};
