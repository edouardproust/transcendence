import { Prisma, Role } from '../prisma/generated/client';
import { PrismaErrorCode } from '../prisma/prisma.error';
import { UsersService } from './users.service';

export const usersFixture: any[] = [
	{
		id: 1,
		email: 'admin@example.com',
		username: 'admin',
		role: Role.ADMIN,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 2,
		email: 'user2@example.com',
		username: 'user',
		role: Role.USER,
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
		deleteOne: jest.fn(),
		updateOneById: jest.fn(),
	},
};

export const adminInDb: any = usersFixture[0];
export const userInDb: any = usersFixture[0];
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
