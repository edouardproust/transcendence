import { FriendsService } from './friends.service';

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
