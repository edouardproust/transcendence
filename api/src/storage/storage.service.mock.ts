import { StorageService } from './storage.service';
import { EXAMPLES } from '../common/constants';

export const StorageServiceMock = {
	provide: StorageService,
	useValue: {
		uploadFile: jest.fn(),
		delete: jest.fn(),
		getUrl: jest.fn().mockReturnValue(EXAMPLES.avatarUrl),
		ensureDefaultAssets: jest.fn(),
	},
};
