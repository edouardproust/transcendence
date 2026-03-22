import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
	getUniqueConstraintFields,
	isPrismaError,
	PrismaErrorCode,
} from '../prisma/prisma.error';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../prisma/generated/client';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateUserSystemDto } from './dtos/update-user-system.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService,
	) {}

	/**
	 * Returns all the registered users.
	 * Endpoint accessible by role ADMIN only.
	 *
	 * @returnsArray of all the registered users. Passwords are omitted for security.
	 */
	async findAll() {
		return this.prismaService.user.findMany({
			omit: { password: true },
		});
	}

	/**
	 *	Return a registered user with a matching id.
	 *
	 * @param id User id
	 * @returns The found user or null, password omitted for security.
	 */
	async findOneById(id: string) {
		return this.prismaService.user.findUnique({
			where: { id },
			omit: { password: true },
		});
	}

	/**
	 *	Return a registered user with a matching email.
	 *
	 * @param email User email
	 * @returns The matching user or null, including password for `bcrypt.compare` in the caller.
	 */
	async findOneByEmail(email: string) {
		return this.prismaService.user.findUnique({
			where: { email },
		});
	}

	/**
	 *	Return a registered user with a matching username.
	 *
	 * @param username
	 * @returns The matching user or null, including password for `bcrypt.compare` in the caller.
	 */
	async findOneByUsername(username: string) {
		return this.prismaService.user.findUnique({
			where: { username },
		});
	}

	/**
	 * Create a user in the database. Password is hashed.
	 *
	 * @param createUserDto
	 * @returns Created user, password omitted for security.
	 *
	 */
	async createOne(createUserDto: CreateUserDto) {
		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

		return this.prismaService.user
			.create({
				data: { ...createUserDto, password: hashedPassword },
				omit: { password: true },
			})
			.catch((error) => {
				if (isPrismaError(error, PrismaErrorCode.UNIQUE_CONSTRAINT)) {
					throw new ConflictException(
						`A user with the same ${getUniqueConstraintFields(error).join(', ')} already exist`,
					);
				}
				throw error;
			});
	}

	/**
	 * Delete the user matching the id from the database.
	 * @param id User id
	 * @return The deleted user, password omitted for security.
	 */
	async deleteOneById(id: string) {
		return this.prismaService.user
			.delete({ where: { id }, omit: { password: true } })
			.catch((error) => {
				if (isPrismaError(error, PrismaErrorCode.NOT_FOUND)) {
					throw new NotFoundException(`User not found`);
				}
				throw error;
			});
	}

	/**
	 * Update a user matching the id in the database.
	 *
	 * @param id User id
	 * @param updateUserDto User poset data
	 * @returns The updated user, password omitted for security.
	 */
	async updateOneById(
		id: string,
		updateUserDto: UpdateUserDto | UpdateProfileDto | UpdateUserSystemDto,
	) {
		const data =
			'password' in updateUserDto && updateUserDto.password
				? {
						...updateUserDto,
						password: await bcrypt.hash(updateUserDto.password, 10),
					}
				: updateUserDto;

		return this.prismaService.user
			.update({
				where: { id },
				data,
				omit: { password: true },
			})
			.catch((error) => {
				if (isPrismaError(error, PrismaErrorCode.NOT_FOUND)) {
					throw new NotFoundException(`User not found`);
				}
				if (isPrismaError(error, PrismaErrorCode.UNIQUE_CONSTRAINT)) {
					throw new ConflictException(
						`A user with the same ${getUniqueConstraintFields(error).join(', ')} already exist`,
					);
				}
				throw error;
			});
	}

	/**
	 * Return a registered user with a matching id, enriched with game statistics.
	 *
	 * @param id User id
	 * @param includeEmail Whether to include the email field (default: false, use true for own profile)
	 * @returns The found user with game stats, password omitted for security. Email omitted unless includeEmail is true.
	 * @throws {NotFoundException} If user not found
	 */
	async findProfileById(id: string, includeEmail = false) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			omit: includeEmail
				? { password: true }
				: { password: true, email: true },
		});
		if (!user) throw new NotFoundException('User not found');

		// TODO: replace with real queries once games module is implemented
		return {
			...user,
			totalGames: 0,
			wins: 0,
			losses: 0,
			draws: 0,
		};
	}

	/**
	 * Search users by username (case-insensitive).
	 *
	 * @param query Search string (minimum 2 characters, enforced by DTO)
	 * @returns List of matching users, password and email omitted for privacy.
	 */
	async search(query: string) {
		return this.prismaService.user.findMany({
			where: {
				username: {
					contains: query,
					mode: Prisma.QueryMode.insensitive,
				},
			},
			omit: { password: true, email: true },
		});
	}

	async uploadAvatar(
		id: string,
		file: Express.Multer.File,
	): Promise<{ message: string; avatarUrl: string }> {
		const user = await this.prismaService.user.findUnique({
			where: { id },
		});
		if (!user) throw new NotFoundException('User not found');

		// Delete old avatar if not default
		if (user.avatarUrl) {
			const oldKey = user.avatarUrl.split(`${process.env.S3_BUCKET}/`)[1];
			if (oldKey) await this.storageService.delete(oldKey);
		}

		const ext = file.mimetype.split('/')[1].replace('svg+xml', 'svg');
		const key = `avatars/${id}-${Date.now()}.${ext}`;
		const avatarUrl = await this.storageService.upload(key, file);

		await this.prismaService.user.update({
			where: { id },
			data: { avatarUrl },
			omit: { password: true },
		});

		return { message: 'Avatar updated successfully', avatarUrl };
	}
}
