import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { SendFriendRequestDto } from './dtos/send-friend-request.dto';
import { FriendRequestResponseDto } from './dtos/friend-request-response.dto';
import { FriendRequestWithSenderDto } from './dtos/friend-request-with-sender.dto';
import { FriendshipResponseDto } from './dtos/friendship-response.dto';
import { UserResponseDto } from '../users/dtos/user-response.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
@ApiTags('friends')
@ApiBearerAuth()
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	@Post('request')
	@ApiOperation({ summary: 'Send a friend request to another user' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Friend request sent',
		type: FriendRequestResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Receiver not found',
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description:
			'Friend request already sent or receiver has already sent a request',
	})
	async sendRequest(
		@CurrentUser() user: RequestUser,
		@Body() dto: SendFriendRequestDto,
	): Promise<FriendRequestResponseDto> {
		return this.friendsService.sendRequest(user.id, dto);
	}

	@Get('requests')
	@ApiOperation({
		summary: 'Get pending incoming friend requests for the current user',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns pending friend requests',
		type: [FriendRequestWithSenderDto],
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	async getPendingRequests(
		@CurrentUser() user: RequestUser,
	): Promise<FriendRequestWithSenderDto[]> {
		return this.friendsService.getPendingRequests(user.id);
	}

	@Post('accept/:requestId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Accept a pending friend request' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Friend request accepted',
		type: FriendshipResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid UUID format',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Not the receiver of this request',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Friend request not found',
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'Already friends',
	})
	async acceptRequest(
		@CurrentUser() user: RequestUser,
		@Param('requestId', ParseUUIDPipe) requestId: string,
	): Promise<FriendshipResponseDto> {
		return this.friendsService.acceptRequest(user.id, requestId);
	}

	@Delete('reject/:requestId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Reject a pending friend request' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Friend request rejected',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid UUID format',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Not the receiver of this request',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Friend request not found',
	})
	async rejectRequest(
		@CurrentUser() user: RequestUser,
		@Param('requestId', ParseUUIDPipe) requestId: string,
	): Promise<void> {
		return this.friendsService.rejectRequest(user.id, requestId);
	}

	@Get()
	@ApiOperation({ summary: 'Get the current user friends list' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns friends list',
		type: [UserResponseDto],
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	async getFriends(
		@CurrentUser() user: RequestUser,
	): Promise<UserResponseDto[]> {
		return this.friendsService.getFriends(user.id);
	}

	@Delete(':friendId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: 'Remove a friend from the current user friends list',
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Friend removed',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid UUID format',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Friendship not found',
	})
	async removeFriend(
		@CurrentUser() user: RequestUser,
		@Param('friendId', ParseUUIDPipe) friendId: string,
	): Promise<void> {
		return this.friendsService.removeFriend(user.id, friendId);
	}
}
