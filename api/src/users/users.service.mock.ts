import { EXAMPLES } from '../common/constants';
import { Prisma, Role } from '../prisma/generated/client';
import { PrismaErrorCode } from '../prisma/prisma.error';
import { UsersService } from './users.service';

export const usersFixture: any[] = [
	{
		id: '550e8400-e29b-41d4-a716-446655440001',
		email: 'admin@example.com',
		username: 'admin',
		role: Role.ADMIN,
		elo: EXAMPLES.elo + 200,
		avatarUrl: EXAMPLES.avatarUrl,
		isOnline: !EXAMPLES.isOnline,
		lastSeen: EXAMPLES.date,
		createdAt: EXAMPLES.date,
		updatedAt: EXAMPLES.date,
	},
	{
		id: EXAMPLES.id,
		email: EXAMPLES.email,
		username: EXAMPLES.username,
		role: EXAMPLES.role,
		elo: EXAMPLES.elo,
		avatarUrl: EXAMPLES.avatarUrl,
		isOnline: EXAMPLES.isOnline,
		lastSeen: EXAMPLES.lastSeen,
		createdAt: EXAMPLES.date,
		updatedAt: EXAMPLES.date,
	},
];

export const UsersServiceMock = {
	provide: UsersService,
	useValue: {
		findAll: jest.fn(),
		findOneById: jest.fn(),
		findOneByEmail: jest.fn(),
		findOneByUsername: jest.fn(),
		createOne: jest.fn(),
		deleteOneById: jest.fn(),
		updateOneById: jest.fn(),
		findProfileById: jest.fn(),
		search: jest.fn(),
	},
};

export const adminInDb: any = usersFixture[0];
export const userInDb: any = usersFixture[1];
export const genericErrorMsg: string = 'Error!';
export const genericError = new Error(genericErrorMsg);
export const prismaUniqueConstraintException =
	new Prisma.PrismaClientKnownRequestError('Unique constraint', {
		code: PrismaErrorCode.UNIQUE_CONSTRAINT,
		clientVersion: '1',
	});
export const prismaNotFoundException = new Prisma.PrismaClientKnownRequestError(
	'Not found',
	{ code: PrismaErrorCode.NOT_FOUND, clientVersion: '1' },
);
