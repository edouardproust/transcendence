import { EXAMPLES } from '../common/constants';
import { Prisma, Role } from '../prisma/generated/client';
import { PrismaErrorCode } from '../prisma/prisma.error';
import { UsersService } from './users.service';

export const usersFixture: any[] = [
	{
		id: EXAMPLES.admin.id,
		email: EXAMPLES.admin.email,
		username: EXAMPLES.admin.username,
		role: EXAMPLES.admin.role,
		elo: EXAMPLES.admin.elo,
		avatarUrl: EXAMPLES.admin.avatarUrl,
		isOnline: EXAMPLES.admin.isOnline,
		lastSeen: EXAMPLES.admin.lastSeen,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: EXAMPLES.user.id,
		email: EXAMPLES.user.email,
		username: EXAMPLES.user.username,
		role: EXAMPLES.user.role,
		elo: EXAMPLES.user.elo,
		avatarUrl: EXAMPLES.user.avatarUrl,
		isOnline: EXAMPLES.user.isOnline,
		lastSeen: EXAMPLES.user.lastSeen,
		createdAt: new Date(),
		updatedAt: new Date(),
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
