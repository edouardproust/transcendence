import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsServiceMock } from './friends.service.mock';

describe('FriendsController', () => {
	let controller: FriendsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FriendsController],
			providers: [FriendsServiceMock],
		}).compile();

		controller = module.get<FriendsController>(FriendsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
