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
			count: jest.fn(),
		},
		game: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			findFirst: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			count: jest.fn(),
		},
		friendRequest: {
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			delete: jest.fn(),
		},
		friendship: {
			create: jest.fn(),
			findMany: jest.fn(),
			deleteMany: jest.fn(),
		},
		$transaction: jest.fn(),
	},
};
