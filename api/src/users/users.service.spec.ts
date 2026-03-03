import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaServiceMock } from '../prisma/prisma.service.mock';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import {
	genericError,
	genericErrorMsg,
	prismaNotFoundException,
	prismaUniqueConstraintException,
	userFixture,
} from './users.service.mock';

jest.mock('bcrypt', () => ({
	hash: jest.fn().mockResolvedValue('hashedPassword'),
	compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
	let service: UsersService;
	let prismaService: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UsersService, PrismaServiceMock],
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
			await service.findAll();
			expect(prismaService.user.findMany).toHaveBeenCalledWith({
				omit: { password: true },
			});
		});
	});

	describe('findOneById', () => {
		it('should query user with password omitted', async () => {
			await service.findOneById(userFixture.id);
			expect(prismaService.user.findUnique).toHaveBeenCalledWith({
				where: { id: userFixture.id },
				omit: { password: true },
			});
		});
	});

	describe('findOneByEmail', () => {
		it('should query user by email', async () => {
			await service.findOneByEmail(userFixture.email);
			expect(prismaService.user.findUnique).toHaveBeenCalledWith({
				where: { email: userFixture.email },
			});
		});
	});

	describe('createOne', () => {
		const createUserDto: CreateUserDto = {
			email: 'new@example.com',
			password: 'password123',
		};

		it('should call create with hashed password and omit password', async () => {
			jest.spyOn(prismaService.user, 'create').mockResolvedValue(
				userFixture,
			);
			await service.createOne(createUserDto);
			expect(bcrypt.hash).toHaveBeenCalledWith(
				createUserDto.password,
				10,
			);
			expect(prismaService.user.create).toHaveBeenCalledWith({
				data: { ...createUserDto, password: 'hashedPassword' },
				omit: { password: true },
			});
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
				userFixture,
			);
			await service.deleteOne(userFixture.id);
			expect(prismaService.user.delete).toHaveBeenCalledWith({
				where: { id: userFixture.id },
				omit: { password: true },
			});
		});

		it('should throw NotFoundException when user not found', async () => {
			jest.spyOn(prismaService.user, 'delete').mockRejectedValue(
				prismaNotFoundException,
			);
			await expect(service.deleteOne(1337)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should rethrow unexpected errors', async () => {
			jest.spyOn(prismaService.user, 'delete').mockRejectedValue(
				genericError,
			);
			await expect(service.deleteOne(999)).rejects.toThrow(
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
				userFixture,
			);
			await service.updateOneById(userFixture.id, updateUserDto);
			expect(prismaService.user.update).toHaveBeenCalledWith({
				where: { id: userFixture.id },
				data: updateUserDto,
				omit: { password: true },
			});
		});

		it('should hash the new password when provided', async () => {
			jest.spyOn(prismaService.user, 'update').mockResolvedValue(
				userFixture,
			);
			await service.updateOneById(
				userFixture.id,
				updateUserDtoWithPassword,
			);
			expect(bcrypt.hash).toHaveBeenCalledWith(
				updateUserDtoWithPassword.password,
				10,
			);
			expect(prismaService.user.update).toHaveBeenCalledWith({
				where: { id: userFixture.id },
				data: { ...updateUserDto, password: 'hashedPassword' },
				omit: { password: true },
			});
		});

		it('should not hash when no password in DTO', async () => {
			jest.spyOn(prismaService.user, 'update').mockResolvedValue(
				userFixture,
			);
			await service.updateOneById(userFixture.id, updateUserDto);
			expect(bcrypt.hash).not.toHaveBeenCalled();
			expect(prismaService.user.update).toHaveBeenCalledWith({
				where: { id: userFixture.id },
				data: updateUserDto,
				omit: { password: true },
			});
		});

		it('should throw NotFoundException when user not found', async () => {
			jest.spyOn(prismaService.user, 'update').mockRejectedValue(
				prismaNotFoundException,
			);
			await expect(
				service.updateOneById(1337, updateUserDto),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw ConflictException on unique constraint violation', async () => {
			jest.spyOn(prismaService.user, 'update').mockRejectedValue(
				prismaUniqueConstraintException,
			);
			await expect(
				service.updateOneById(userFixture.id, updateUserDto),
			).rejects.toThrow(ConflictException);
		});

		it('should rethrow unexpected errors', async () => {
			jest.spyOn(prismaService.user, 'update').mockRejectedValue(
				genericError,
			);
			await expect(
				service.updateOneById(1337, updateUserDto),
			).rejects.toThrow(genericErrorMsg);
		});
	});
});
