import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { SendFriendRequestDto } from './dtos/send-friend-request.dto';
import { FriendRequestResponseDto } from './dtos/friend-request-response.dto';
import { FriendRequestWithSenderDto } from './dtos/friend-request-with-sender.dto';
import { FriendshipResponseDto } from './dtos/friendship-response.dto';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { EXAMPLES } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaError, PrismaErrorCode } from '../prisma/prisma.error';
import { UsersService } from '../users/users.service';

@Injectable()
export class FriendsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

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
					throw new NotFoundException('User not found');
				}
				throw error;
			});
	}

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

	async acceptRequest(
		userId: string,
		requestId: string,
	): Promise<FriendshipResponseDto> {
		// TODO: implement
		return {
			id: EXAMPLES.id,
			userId,
			friendId: EXAMPLES.id.slice(0, -1) + '1',
			createdAt: new Date(),
		};
	}

	async rejectRequest(userId: string, requestId: string): Promise<void> {
		// TODO: implement
	}

	async getFriends(userId: string): Promise<UserResponseDto[]> {
		// TODO: implement
		return [];
	}

	async removeFriend(userId: string, friendId: string): Promise<void> {
		// TODO: implement
	}
}
