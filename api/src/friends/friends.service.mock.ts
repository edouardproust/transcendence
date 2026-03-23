import { DEFAULTS, EXAMPLES } from '../common/constants';
import { Prisma } from '../prisma/generated/client';
import { PrismaErrorCode } from '../prisma/prisma.error';
import { FriendsService } from './friends.service';

export const friendsFixture = {
	userId: EXAMPLES.id,
	friendRequestResponse: {
		id: EXAMPLES.id2,
		senderId: EXAMPLES.id3,
		receiverId: EXAMPLES.id,
		createdAt: EXAMPLES.date,
	},
	friendRequestWithSender: {
		id: EXAMPLES.id2,
		senderId: EXAMPLES.id3,
		receiverId: EXAMPLES.id,
		createdAt: EXAMPLES.date,
		username: EXAMPLES.username,
		elo: EXAMPLES.elo,
		avatarKey: DEFAULTS.avatar.remoteKey,
		isOnline: EXAMPLES.isOnline,
		lastSeen: EXAMPLES.lastSeen,
	},
	friendshipResponse: {
		id: EXAMPLES.id2,
		userId: EXAMPLES.id,
		friendId: EXAMPLES.id3,
		createdAt: EXAMPLES.date,
	},
};

export const FriendsServiceMock = {
	provide: FriendsService,
	useValue: {
		sendRequest: jest.fn(),
		getPendingRequests: jest.fn(),
		acceptRequest: jest.fn(),
		rejectRequest: jest.fn(),
		getFriends: jest.fn(),
		removeFriend: jest.fn(),
	},
};

export const prismaUniqueConstraintException =
	new Prisma.PrismaClientKnownRequestError('Unique constraint', {
		code: PrismaErrorCode.UNIQUE_CONSTRAINT,
		clientVersion: '1',
	});

export const prismaForeignKeyException =
	new Prisma.PrismaClientKnownRequestError('Foreign key constraint', {
		code: PrismaErrorCode.FOREIGN_KEY_CONSTRAINT,
		clientVersion: '1',
	});

export const genericErrorMsg = 'Error!';
export const genericError = new Error(genericErrorMsg);
