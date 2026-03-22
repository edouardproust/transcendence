import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { S3Client } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3', () => ({
	S3Client: jest.fn().mockImplementation(() => ({
		send: jest.fn(),
	})),
	PutObjectCommand: jest.fn(),
	DeleteObjectCommand: jest.fn(),
	HeadObjectCommand: jest.fn(),
}));

jest.mock('fs', () => ({
	readFileSync: jest.fn().mockReturnValue('<svg></svg>'),
}));

describe('StorageService', () => {
	let service: StorageService;
	let s3Send: jest.Mock;

	beforeEach(async () => {
		process.env.S3_BUCKET = 'test-bucket';
		process.env.AWS_REGION = 'eu-west-3';
		process.env.AWS_ACCESS_KEY_ID = 'test-key';
		process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
		process.env.NODE_ENV = 'development';
		process.env.S3_PUBLIC_URL = 'http://localhost:9000';

		const module: TestingModule = await Test.createTestingModule({
			providers: [StorageService],
		}).compile();

		service = module.get<StorageService>(StorageService);
		s3Send = (service as any).client.send;
	});

	describe('constructor', () => {
		it('should be defined', () => {
			expect(service).toBeDefined();
		});
	});

	describe('getUrl', () => {
		it('should return MinIO URL in dev', () => {
			const url = service.getUrl('avatars/test.jpg');
			expect(url).toBe(
				'http://localhost:9000/test-bucket/avatars/test.jpg',
			);
		});

		it('should return AWS S3 URL in prod', () => {
			process.env.NODE_ENV = 'production';
			const prodService = new StorageService();
			const url = prodService.getUrl('avatars/test.jpg');
			expect(url).toBe(
				'https://test-bucket.s3.eu-west-3.amazonaws.com/avatars/test.jpg',
			);
		});
	});

	describe('uploadFile', () => {
		it('should call S3Client.send with PutObjectCommand', async () => {
			s3Send.mockResolvedValue({});
			await service.uploadFile(
				'avatars/test.jpg',
				Buffer.from('test'),
				'image/jpeg',
			);
			expect(s3Send).toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('should call S3Client.send with DeleteObjectCommand', async () => {
			s3Send.mockResolvedValue({});
			await service.delete('avatars/test.jpg');
			expect(s3Send).toHaveBeenCalled();
		});
	});

	describe('ensureDefaultAssets', () => {
		it('should skip upload if default avatar already exists', async () => {
			s3Send.mockResolvedValueOnce({});
			await service.ensureDefaultAssets();
			expect(s3Send).toHaveBeenCalledTimes(1);
		});

		it('should upload default avatar if it does not exist', async () => {
			s3Send.mockRejectedValueOnce(new Error('NotFound'));
			s3Send.mockResolvedValueOnce({});
			await service.ensureDefaultAssets();
			expect(s3Send).toHaveBeenCalledTimes(2);
		});
	});
});
