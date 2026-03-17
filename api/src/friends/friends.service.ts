import { Injectable } from '@nestjs/common';
import { SendFriendRequestDto } from './dtos/send-friend-request.dto';
import { FriendRequestResponseDto } from './dtos/friend-request-response.dto';
import { FriendRequestWithSenderDto } from './dtos/friend-request-with-sender.dto';
import { FriendshipResponseDto } from './dtos/friendship-response.dto';

@Injectable()
export class FriendsService {
	async sendRequest(
		senderId: string,
		dto: SendFriendRequestDto,
	): Promise<FriendRequestResponseDto> {
		// TODO: implement
		return {
			id: 'uuid',
			senderId,
			receiverId: dto.receiverId,
			createdAt: new Date(),
		};
	}

	async getPendingRequests(
		userId: string,
	): Promise<FriendRequestWithSenderDto[]> {
		// TODO: implement
		return [];
	}

	async acceptRequest(
		userId: string,
		requestId: string,
	): Promise<FriendshipResponseDto> {
		// TODO: implement
		return {
			id: 'uuid',
			userId,
			friendId: 'uuid',
			createdAt: new Date(),
		};
	}

	async rejectRequest(userId: string, requestId: string): Promise<void> {
		// TODO: implement
	}

	async getFriends(userId: string): Promise<FriendshipResponseDto[]> {
		// TODO: implement
		return [];
	}

	async removeFriend(userId: string, friendId: string): Promise<void> {
		// TODO: implement
	}
}
