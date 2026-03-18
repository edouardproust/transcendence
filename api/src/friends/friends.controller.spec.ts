import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendsServiceMock, friendsFixture } from './friends.service.mock';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { Role } from '../prisma/generated/enums';

describe('FriendsController', () => {
	let controller: FriendsController;
	let friendsService: FriendsService;

	const userFixture: RequestUser = {
		id: friendsFixture.userId,
		role: Role.USER,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FriendsController],
			providers: [FriendsServiceMock],
		}).compile();

		controller = module.get<FriendsController>(FriendsController);
		friendsService = module.get<FriendsService>(FriendsService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('sendRequest', () => {
		it('should call service.sendRequest with correct userId and dto', async () => {
			const dto = {
				receiverId: friendsFixture.friendRequestResponse.receiverId,
			};
			await controller.sendRequest(userFixture, dto);
			expect(friendsService.sendRequest).toHaveBeenCalledWith(
				userFixture.id,
				dto,
			);
		});
	});

	describe('getPendingRequests', () => {
		it('should call service.getPendingRequests with correct userId', async () => {
			await controller.getPendingRequests(userFixture);
			expect(friendsService.getPendingRequests).toHaveBeenCalledWith(
				userFixture.id,
			);
		});
	});

	describe('acceptRequest', () => {
		it('should call service.acceptRequest with correct userId and requestId', async () => {
			const requestId = friendsFixture.friendRequestResponse.id;
			await controller.acceptRequest(userFixture, requestId);
			expect(friendsService.acceptRequest).toHaveBeenCalledWith(
				userFixture.id,
				requestId,
			);
		});
	});

	describe('rejectRequest', () => {
		it('should call service.rejectRequest with correct userId and requestId', async () => {
			const requestId = friendsFixture.friendRequestResponse.id;
			await controller.rejectRequest(userFixture, requestId);
			expect(friendsService.rejectRequest).toHaveBeenCalledWith(
				userFixture.id,
				requestId,
			);
		});
	});

	describe('getFriends', () => {
		it('should call service.getFriends with correct userId', async () => {
			await controller.getFriends(userFixture);
			expect(friendsService.getFriends).toHaveBeenCalledWith(
				userFixture.id,
			);
		});
	});

	describe('removeFriend', () => {
		it('should call service.removeFriend with correct userId and friendId', async () => {
			const friendId = friendsFixture.friendshipResponse.friendId;
			await controller.removeFriend(userFixture, friendId);
			expect(friendsService.removeFriend).toHaveBeenCalledWith(
				userFixture.id,
				friendId,
			);
		});
	});
});
