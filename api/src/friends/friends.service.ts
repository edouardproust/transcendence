import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { SendFriendRequestDto } from './dtos/send-friend-request.dto';
import { FriendRequestResponseDto } from './dtos/friend-request-response.dto';
import { FriendRequestWithSenderDto } from './dtos/friend-request-with-sender.dto';
import { FriendshipResponseDto } from './dtos/friendship-response.dto';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaError, PrismaErrorCode } from '../prisma/prisma.error';
import { UsersService } from '../users/users.service';

/**
 * Service handling friend requests and friendships between users.
 */
@Injectable()
export class FriendsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	/**
	 * Sends a friend request from one user to another.
	 *
	 * @throws {ConflictException} If a friend request has already been sent.
	 * @throws {NotFoundException} If the receiver does not exist.
	 */
	async sendRequest(
		senderId: string,
		dto: SendFriendRequestDto,
	): Promise<FriendRequestResponseDto> {
		return this.prismaService.friendRequest
			.create({
				data: {
					senderId,
					receiverId: dto.receiverId,
				},
			})
			.catch((error) => {
				if (isPrismaError(error, PrismaErrorCode.UNIQUE_CONSTRAINT)) {
					throw new ConflictException('Friend request already sent');
				}
				if (
					isPrismaError(error, PrismaErrorCode.FOREIGN_KEY_CONSTRAINT)
				) {
					throw new NotFoundException('Receiver not found');
				}
				throw error;
			});
	}

	/**
	 * Returns all pending incoming friend requests for a given user,
	 * ordered by most recent first.
	 */
	async getPendingRequests(
		userId: string,
	): Promise<FriendRequestWithSenderDto[]> {
		const requests = await this.prismaService.friendRequest.findMany({
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

		return requests.map((request) => ({
			...this.usersService.mapUser(request.sender),
			id: request.id,
			senderId: request.senderId,
			createdAt: request.createdAt,
		}));
	}

	/**
	 * Accepts a pending friend request.
	 * Deletes the request and creates a friendship in a single transaction.
	 *
	 * @throws {NotFoundException} If the friend request does not exist.
	 * @throws {ForbiddenException} If the current user is not the receiver of the request.
	 * @throws {ConflictException} If the users are already friends.
	 */
	async acceptRequest(
		userId: string,
		requestId: string,
	): Promise<FriendshipResponseDto> {
		const request = await this.prismaService.friendRequest.findUnique({
			where: { id: requestId },
		});

		if (!request) throw new NotFoundException('Friend request not found');
		if (request.receiverId !== userId)
			throw new ForbiddenException('Not the receiver of this request');

		return this.prismaService.$transaction(async (tx) => {
			await tx.friendRequest.delete({ where: { id: requestId } });

			const friendship = await tx.friendship
				.create({
					data: { userId, friendId: request.senderId },
				})
				.catch((error) => {
					if (isPrismaError(error, PrismaErrorCode.UNIQUE_CONSTRAINT))
						throw new ConflictException('Already friends');
					throw error;
				});

			return friendship;
		});
	}

	/**
	 * Rejects a pending friend request by deleting it.
	 *
	 * @throws {NotFoundException} If the friend request does not exist.
	 * @throws {ForbiddenException} If the current user is not the receiver of the request.
	 */
	async rejectRequest(userId: string, requestId: string): Promise<void> {
		const request = await this.prismaService.friendRequest.findUnique({
			where: { id: requestId },
		});

		if (!request) throw new NotFoundException('Friend request not found');
		if (request.receiverId !== userId)
			throw new ForbiddenException('Not the receiver of this request');

		await this.prismaService.friendRequest.delete({
			where: { id: requestId },
		});
	}

	/**
	 * Returns the friends list of a given user.
	 * Friendships are stored directionally — both directions are queried
	 * and the other user is returned in each case.
	 */
	async getFriends(userId: string): Promise<UserResponseDto[]> {
		const friendships = await this.prismaService.friendship.findMany({
			where: {
				OR: [{ userId }, { friendId: userId }],
			},
			orderBy: { createdAt: 'desc' },
			include: { friend: true, user: true },
		});

		// return the friend only (not current user)
		return friendships.map((f) =>
			this.usersService.mapUser(f.userId === userId ? f.friend : f.user),
		);
	}

	/**
	 * Removes a friendship between two users.
	 * Queries both directions since the friendship entry may have been created
	 * with either user as `userId`.
	 *
	 * @throws {NotFoundException} If no friendship exists between the two users.
	 */
	async removeFriend(userId: string, friendId: string): Promise<void> {
		const result = await this.prismaService.friendship.deleteMany({
			where: {
				OR: [
					{ userId, friendId },
					{ userId: friendId, friendId: userId },
				],
			},
		});

		if (result.count === 0)
			throw new NotFoundException('Friendship not found');
	}
}
