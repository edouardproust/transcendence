import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/prisma.service.mock';
import {
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import {
	friendsFixture,
	genericError,
	genericErrorMsg,
	prismaForeignKeyException,
	prismaUniqueConstraintException,
} from './friends.service.mock';
import { UsersServiceMock } from '../users/users.service.mock';

describe('FriendsService', () => {
	let service: FriendsService;
	let prismaService: PrismaService;

	const {
		userId,
		friendRequestResponse,
		friendRequestWithSender,
		friendshipResponse,
	} = friendsFixture;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [FriendsService, PrismaServiceMock, UsersServiceMock],
		}).compile();

		service = module.get<FriendsService>(FriendsService);
		prismaService = module.get<PrismaService>(PrismaService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('sendRequest', () => {
		const dto = { receiverId: friendRequestResponse.receiverId };

		it('should create a friend request', async () => {
			jest.spyOn(prismaService.friendRequest, 'create').mockResolvedValue(
				friendRequestResponse as any,
			);
			const result = await service.sendRequest(userId, dto);
			expect(prismaService.friendRequest.create).toHaveBeenCalledWith({
				data: { senderId: userId, receiverId: dto.receiverId },
			});
			expect(result).toEqual(friendRequestResponse);
		});

		it('should throw ConflictException on unique constraint violation', async () => {
			jest.spyOn(prismaService.friendRequest, 'create').mockRejectedValue(
				prismaUniqueConstraintException,
			);
			await expect(service.sendRequest(userId, dto)).rejects.toThrow(
				ConflictException,
			);
		});

		it('should throw NotFoundException on foreign key constraint violation', async () => {
			jest.spyOn(prismaService.friendRequest, 'create').mockRejectedValue(
				prismaForeignKeyException,
			);
			await expect(service.sendRequest(userId, dto)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should rethrow unexpected errors', async () => {
			jest.spyOn(prismaService.friendRequest, 'create').mockRejectedValue(
				genericError,
			);
			await expect(service.sendRequest(userId, dto)).rejects.toThrow(
				genericErrorMsg,
			);
		});
	});

	describe('getPendingRequests', () => {
		it('should return mapped pending requests', async () => {
			jest.spyOn(
				prismaService.friendRequest,
				'findMany',
			).mockResolvedValue([
				{
					id: friendRequestResponse.id,
					senderId: friendRequestResponse.senderId,
					receiverId: friendRequestResponse.receiverId,
					createdAt: friendRequestResponse.createdAt,
					sender: {
						username: friendRequestWithSender.username,
						elo: friendRequestWithSender.elo,
						avatarKey: friendRequestWithSender.avatarKey,
						isOnline: friendRequestWithSender.isOnline,
						lastSeen: friendRequestWithSender.lastSeen,
					},
				},
			] as any);

			const result = await service.getPendingRequests(userId);

			expect(prismaService.friendRequest.findMany).toHaveBeenCalledWith({
				where: { receiverId: userId },
				include: {
					sender: {
						select: {
							username: true,
							elo: true,
							avatarKey: true,
							isOnline: true,
							lastSeen: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});
			expect(result[0]).toMatchObject({
				id: friendRequestResponse.id,
				senderId: friendRequestResponse.senderId,
				username: friendRequestWithSender.username,
			});
		});
	});

	describe('acceptRequest', () => {
		it('should delete request and create friendship in transaction', async () => {
			jest.spyOn(
				prismaService.friendRequest,
				'findUnique',
			).mockResolvedValue(friendRequestResponse as any);
			jest.spyOn(prismaService, '$transaction').mockImplementation(
				async (cb: any) => {
					return cb({
						friendRequest: {
							delete: jest.fn().mockResolvedValue(undefined),
						},
						friendship: {
							create: jest
								.fn()
								.mockResolvedValue(friendshipResponse),
						},
					});
				},
			);

			const result = await service.acceptRequest(
				userId,
				friendRequestResponse.id,
			);
			expect(result).toEqual(friendshipResponse);
		});

		it('should throw NotFoundException when request not found', async () => {
			jest.spyOn(
				prismaService.friendRequest,
				'findUnique',
			).mockResolvedValue(null);
			await expect(
				service.acceptRequest(userId, friendRequestResponse.id),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw ForbiddenException when user is not the receiver', async () => {
			jest.spyOn(
				prismaService.friendRequest,
				'findUnique',
			).mockResolvedValue({
				...friendRequestResponse,
				receiverId: 'other-user-id',
			} as any);
			await expect(
				service.acceptRequest(userId, friendRequestResponse.id),
			).rejects.toThrow(ForbiddenException);
		});

		it('should throw ConflictException when already friends', async () => {
			jest.spyOn(
				prismaService.friendRequest,
				'findUnique',
			).mockResolvedValue(friendRequestResponse as any);
			jest.spyOn(prismaService, '$transaction').mockImplementation(
				async (cb: any) => {
					return cb({
						friendRequest: {
							delete: jest.fn().mockResolvedValue(undefined),
						},
						friendship: {
							create: jest
								.fn()
								.mockRejectedValue(
									prismaUniqueConstraintException,
								),
						},
					});
				},
			);
			await expect(
				service.acceptRequest(userId, friendRequestResponse.id),
			).rejects.toThrow(ConflictException);
		});
	});

	describe('rejectRequest', () => {
		it('should delete the friend request', async () => {
			jest.spyOn(
				prismaService.friendRequest,
				'findUnique',
			).mockResolvedValue(friendRequestResponse as any);
			jest.spyOn(prismaService.friendRequest, 'delete').mockResolvedValue(
				undefined as any,
			);

			await service.rejectRequest(userId, friendRequestResponse.id);

			expect(prismaService.friendRequest.delete).toHaveBeenCalledWith({
				where: { id: friendRequestResponse.id },
			});
		});

		it('should throw NotFoundException when request not found', async () => {
			jest.spyOn(
				prismaService.friendRequest,
				'findUnique',
			).mockResolvedValue(null);
			await expect(
				service.rejectRequest(userId, friendRequestResponse.id),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw ForbiddenException when user is not the receiver', async () => {
			jest.spyOn(
				prismaService.friendRequest,
				'findUnique',
			).mockResolvedValue({
				...friendRequestResponse,
				receiverId: 'other-user-id',
			} as any);
			await expect(
				service.rejectRequest(userId, friendRequestResponse.id),
			).rejects.toThrow(ForbiddenException);
		});
	});

	describe('getFriends', () => {
		it('should return friends from both directions', async () => {
			const friendUser = {
				id: friendshipResponse.friendId,
				username: 'friend',
			};
			const currentUser = { id: userId, username: 'me' };

			jest.spyOn(prismaService.friendship, 'findMany').mockResolvedValue([
				{
					userId,
					friendId: friendshipResponse.friendId,
					user: currentUser,
					friend: friendUser,
				},
				{
					userId: friendshipResponse.friendId,
					friendId: userId,
					user: friendUser,
					friend: currentUser,
				},
			] as any);

			const result = await service.getFriends(userId);

			expect(prismaService.friendship.findMany).toHaveBeenCalledWith({
				where: { OR: [{ userId }, { friendId: userId }] },
				include: { friend: true, user: true },
			});
			expect(result).toContainEqual(friendUser);
			expect(result).toHaveLength(2);
		});
	});

	describe('removeFriend', () => {
		it('should delete friendship in both directions', async () => {
			jest.spyOn(
				prismaService.friendship,
				'deleteMany',
			).mockResolvedValue({ count: 1 });

			await service.removeFriend(userId, friendshipResponse.friendId);

			expect(prismaService.friendship.deleteMany).toHaveBeenCalledWith({
				where: {
					OR: [
						{ userId, friendId: friendshipResponse.friendId },
						{
							userId: friendshipResponse.friendId,
							friendId: userId,
						},
					],
				},
			});
		});

		it('should throw NotFoundException when friendship not found', async () => {
			jest.spyOn(
				prismaService.friendship,
				'deleteMany',
			).mockResolvedValue({ count: 0 });
			await expect(
				service.removeFriend(userId, friendshipResponse.friendId),
			).rejects.toThrow(NotFoundException);
		});
	});
});
