import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaServiceMock } from '../prisma/prisma.service.mock';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
	genericError,
	genericErrorMsg,
	prismaNotFoundException,
	prismaUniqueConstraintException,
	userInDb,
	usersFixture,
} from './users.service.mock';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { DEFAULTS } from '../common/constants';
import { StorageService } from '../storage/storage.service';

jest.mock('bcrypt', () => ({
	hash: jest.fn().mockResolvedValue('hashedPassword'),
	compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
	let service: UsersService;
	let prismaService: PrismaService;
	let module: TestingModule;

	beforeEach(async () => {
		module = await Test.createTestingModule({
			providers: [UsersService, PrismaServiceMock, StorageServiceMock],
		}).compile();
		service = module.get<UsersService>(UsersService);
		prismaService = module.get<PrismaService>(PrismaService);
	});

	describe('constructor', () => {
		it('should define needed services', () => {
			expect(service).toBeDefined();
			expect(prismaService).toBeDefined();
		});
	});

	describe('findAll', () => {
		it('should query users with password omitted', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(
				usersFixture,
			);
			const users = await service.findAll();
			expect(prismaService.user.findMany).toHaveBeenCalledWith({
				omit: { password: true },
			});
			users.forEach((user) =>
				expect(user).not.toHaveProperty('password'),
			);
		});
	});

	describe('findOneById', () => {
		it('should query user with password omitted', async () => {
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				userInDb,
			);
			const user = await service.findOneById(userInDb.id);
			expect(prismaService.user.findUnique).toHaveBeenCalledWith({
				where: { id: userInDb.id },
				omit: { password: true },
			});
			expect(user).not.toHaveProperty('password');
		});
	});

	describe('findOneByEmail', () => {
		it('should query user by email', async () => {
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				userInDb,
			);
			const user = await service.findOneByEmail(userInDb.email);
			expect(prismaService.user.findUnique).toHaveBeenCalledWith({
				where: { email: userInDb.email },
			});
			expect(user).not.toHaveProperty('password');
		});
	});

	describe('findOneByUsername', () => {
		it('should query user by email', async () => {
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				userInDb,
			);
			const user = await service.findOneByUsername(userInDb.email);
			expect(prismaService.user.findUnique).toHaveBeenCalledWith({
				where: { email: userInDb.email },
			});
			expect(user).not.toHaveProperty('password');
		});
	});

	describe('createOne', () => {
		const createUserDto: CreateUserDto = {
			email: userInDb.email,
			password: 'password',
			username: userInDb.username,
		};

		it('should call create with hashed password and omit password', async () => {
			jest.spyOn(prismaService.user, 'create').mockResolvedValue(
				userInDb,
			);
			const createdUser = await service.createOne(createUserDto);
			expect(bcrypt.hash).toHaveBeenCalledWith(
				createUserDto.password,
				10,
			);
			expect(prismaService.user.create).toHaveBeenCalledWith({
				data: { ...createUserDto, password: 'hashedPassword' },
				omit: { password: true },
			});
			expect(createdUser).toHaveProperty('role');
			expect(createdUser).toHaveProperty('email', createUserDto.email);
			expect(createdUser).toHaveProperty(
				'username',
				createUserDto.username,
			);
		});

		it('should throw ConflictException on unique constraint violation', async () => {
			jest.spyOn(prismaService.user, 'create').mockRejectedValue(
				prismaUniqueConstraintException,
			);
			await expect(service.createOne(createUserDto)).rejects.toThrow(
				ConflictException,
			);
		});

		it('should rethrow unexpected errors', async () => {
			jest.spyOn(prismaService.user, 'create').mockRejectedValue(
				genericError,
			);
			await expect(service.createOne(createUserDto)).rejects.toThrow(
				genericErrorMsg,
			);
		});
	});

	describe('deleteOne', () => {
		it('should delete user by id with password omitted', async () => {
			jest.spyOn(prismaService.user, 'delete').mockResolvedValue(
				userInDb,
			);
			await service.deleteOneById(userInDb.id);
			expect(prismaService.user.delete).toHaveBeenCalledWith({
				where: { id: userInDb.id },
				omit: { password: true },
			});
		});

		it('should throw NotFoundException when user not found', async () => {
			jest.spyOn(prismaService.user, 'delete').mockRejectedValue(
				prismaNotFoundException,
			);
			await expect(service.deleteOneById('invalid-uuid')).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should rethrow unexpected errors', async () => {
			jest.spyOn(prismaService.user, 'delete').mockRejectedValue(
				genericError,
			);
			await expect(service.deleteOneById('invalid-uuid')).rejects.toThrow(
				genericErrorMsg,
			);
		});
	});

	describe('updateOneById', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		const updateUserDto: UpdateUserDto = {
			email: 'updated@example.com',
		};

		const updateUserDtoWithPassword: UpdateUserDto = {
			email: 'updated@example.com',
			password: 'newpassword123',
		};

		it('should call update with correct arguments', async () => {
			jest.spyOn(prismaService.user, 'update').mockResolvedValue(
				userInDb,
			);
			await service.updateOneById(userInDb.id, updateUserDto);
			expect(prismaService.user.update).toHaveBeenCalledWith({
				where: { id: userInDb.id },
				data: updateUserDto,
				omit: { password: true },
			});
		});

		it('should hash the new password when provided', async () => {
			jest.spyOn(prismaService.user, 'update').mockResolvedValue(
				userInDb,
			);
			await service.updateOneById(userInDb.id, updateUserDtoWithPassword);
			expect(bcrypt.hash).toHaveBeenCalledWith(
				updateUserDtoWithPassword.password,
				10,
			);
			expect(prismaService.user.update).toHaveBeenCalledWith({
				where: { id: userInDb.id },
				data: { ...updateUserDto, password: 'hashedPassword' },
				omit: { password: true },
			});
		});

		it('should not hash when no password in DTO', async () => {
			jest.spyOn(prismaService.user, 'update').mockResolvedValue(
				userInDb,
			);
			await service.updateOneById(userInDb.id, updateUserDto);
			expect(bcrypt.hash).not.toHaveBeenCalled();
			expect(prismaService.user.update).toHaveBeenCalledWith({
				where: { id: userInDb.id },
				data: updateUserDto,
				omit: { password: true },
			});
		});

		it('should throw NotFoundException when user not found', async () => {
			jest.spyOn(prismaService.user, 'update').mockRejectedValue(
				prismaNotFoundException,
			);
			await expect(
				service.updateOneById('invalid-uuid', updateUserDto),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw ConflictException on unique constraint violation', async () => {
			jest.spyOn(prismaService.user, 'update').mockRejectedValue(
				prismaUniqueConstraintException,
			);
			await expect(
				service.updateOneById(userInDb.id, updateUserDto),
			).rejects.toThrow(ConflictException);
		});

		it('should rethrow unexpected errors', async () => {
			jest.spyOn(prismaService.user, 'update').mockRejectedValue(
				genericError,
			);
			await expect(
				service.updateOneById('invalid-uuid', updateUserDto),
			).rejects.toThrow(genericErrorMsg);
		});
	});
	describe('findProfileById', () => {
		it('should return user profile with game stats', async () => {
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				userInDb,
			);
			jest.spyOn(prismaService.game, 'count')
				.mockResolvedValueOnce(10) // totalGames
				.mockResolvedValueOnce(6) // wins
				.mockResolvedValueOnce(2); // draws

			const result = await service.findProfileById(userInDb.id);

			expect(prismaService.user.findUnique).toHaveBeenCalledWith({
				where: { id: userInDb.id },
				omit: { password: true, email: true },
			});
			expect(result).toMatchObject({
				totalGames: 10,
				wins: 6,
				losses: 2,
				draws: 2,
			});
		});

		it('should include email when includeEmail is true', async () => {
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				userInDb,
			);
			jest.spyOn(prismaService.game, 'count').mockResolvedValue(0);

			await service.findProfileById(userInDb.id, true);

			expect(prismaService.user.findUnique).toHaveBeenCalledWith({
				where: { id: userInDb.id },
				omit: { password: true },
			});
		});

		it('should throw NotFoundException when user not found', async () => {
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				null,
			);
			await expect(
				service.findProfileById('invalid-uuid'),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('search', () => {
		it('should return matching users with password and email omitted', async () => {
			jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(
				usersFixture,
			);

			const result = await service.search('user');

			expect(prismaService.user.findMany).toHaveBeenCalledWith({
				where: {
					username: {
						contains: 'user',
						mode: 'insensitive',
					},
				},
				omit: { password: true, email: true },
			});
			expect(result).toBeDefined();
		});
	});

	describe('uploadAvatar', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		const file = {
			buffer: Buffer.from('test'),
			mimetype: 'image/jpeg',
		} as Express.Multer.File;

		it('should upload avatar and return avatarUrl', async () => {
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				userInDb,
			);
			jest.spyOn(prismaService.user, 'update').mockResolvedValue(
				userInDb,
			);

			const result = await service.uploadAvatar(userInDb.id, file);

			expect(result).toHaveProperty('avatarUrl');
		});

		it('should delete old avatar if not default', async () => {
			const userWithAvatar = {
				...userInDb,
				avatarKey: 'avatars/old.jpg',
			};
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				userWithAvatar as any,
			);
			jest.spyOn(prismaService.user, 'update').mockResolvedValue(
				userInDb,
			);

			await service.uploadAvatar(userInDb.id, file);

			const storageService = module.get(StorageService);
			expect(storageService.delete).toHaveBeenCalledWith(
				'avatars/old.jpg',
			);
		});

		it('should not delete avatar if it is the default', async () => {
			const userWithDefault = {
				...userInDb,
				avatarKey: DEFAULTS.avatar.remoteKey,
			};
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				userWithDefault as any,
			);
			jest.spyOn(prismaService.user, 'update').mockResolvedValue(
				userInDb,
			);

			await service.uploadAvatar(userInDb.id, file);

			const storageService = module.get(StorageService);
			expect(storageService.delete).not.toHaveBeenCalled();
		});

		it('should throw NotFoundException when user not found', async () => {
			jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
				null,
			);
			await expect(
				service.uploadAvatar('invalid-uuid', file),
			).rejects.toThrow(NotFoundException);
		});
	});
});
