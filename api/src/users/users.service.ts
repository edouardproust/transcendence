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
import { GameStatus, Prisma } from '../prisma/generated/client';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateUserSystemDto } from './dtos/update-user-system.dto';
import { StorageService } from '../storage/storage.service';
import { DEFAULTS } from '../common/constants';
import { UpdateUserAdminDto } from './dtos/update-user-admin.dto';

@Injectable()
export class UsersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService,
	) {}

	mapUser(user: any): any {
		const { avatarKey, ...rest } = user;
		return {
			...rest,
			avatarUrl: this.storageService.getUrl(user.avatarKey),
		};
	}

	/**
	 * Returns all the registered users.
	 * Endpoint accessible by role ADMIN only.
	 *
	 * @returnsArray of all the registered users. Passwords are omitted for security.
	 */
	async findAll() {
		const users = await this.prismaService.user.findMany({
			omit: { password: true },
		});
		return users.map((u) => this.mapUser(u));
	}

	/**
	 *	Return a registered user with a matching id.
	 *
	 * @param id User id
	 * @returns The found user or null, password omitted for security.
	 */
	async findOneById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			omit: { password: true },
		});
		return user ? this.mapUser(user) : null;
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

		const user = await this.prismaService.user
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
		return this.mapUser(user);
	}

	/**
	 * Delete the user matching the id from the database.
	 * @param id User id
	 * @return The deleted user, password omitted for security.
	 */
	async deleteOneById(id: string) {
		const user = await this.prismaService.user
			.delete({ where: { id }, omit: { password: true } })
			.catch((error) => {
				if (isPrismaError(error, PrismaErrorCode.NOT_FOUND)) {
					throw new NotFoundException(`User not found`);
				}
				throw error;
			});
		return this.mapUser(user);
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
		updateUserDto:
			| UpdateUserDto
			| UpdateProfileDto
			| UpdateUserAdminDto
			| UpdateUserSystemDto,
	) {
		const data =
			'password' in updateUserDto && updateUserDto.password
				? {
						...updateUserDto,
						password: await bcrypt.hash(updateUserDto.password, 10),
					}
				: updateUserDto;

		const user = await this.prismaService.user
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
		return this.mapUser(user);
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

		const [totalGames, wins, draws] = await Promise.all([
			this.prismaService.game.count({
				where: {
					OR: [{ whiteId: id }, { blackId: id }],
					status: GameStatus.FINISHED,
				},
			}),
			this.prismaService.game.count({
				where: { winnerId: id },
			}),
			this.prismaService.game.count({
				where: {
					OR: [{ whiteId: id }, { blackId: id }],
					status: GameStatus.FINISHED,
					winnerId: null,
				},
			}),
		]);

		return {
			...this.mapUser(user),
			totalGames,
			wins,
			losses: totalGames - wins - draws,
			draws,
		};
	}

	/**
	 * Search users by username (case-insensitive).
	 *
	 * @param query Search string (minimum 2 characters, enforced by DTO)
	 * @returns List of matching users, password and email omitted for privacy.
	 */
	async search(query: string) {
		const users = await this.prismaService.user.findMany({
			where: {
				username: {
					contains: query,
					mode: Prisma.QueryMode.insensitive,
				},
			},
			omit: { password: true, email: true },
		});
		return users.map((u) => this.mapUser(u));
	}

	/**
	 * Upload and replace the avatar of a user.
	 * The old avatar is deleted from S3 unless it is the default avatar.
	 * The new avatar key is stored in the database.
	 *
	 * @param id User id
	 * @param file Uploaded image file (validated by UploadedImage decorator)
	 * @returns The public URL of the new avatar
	 * @throws {NotFoundException} If user not found
	 */
	async uploadAvatar(
		id: string,
		file: Express.Multer.File,
	): Promise<{ avatarUrl: string }> {
		const user = await this.prismaService.user.findUnique({
			where: { id },
		});
		if (!user) throw new NotFoundException('User not found');

		// Delete old avatar if not default
		if (user.avatarKey && user.avatarKey !== DEFAULTS.avatar.remoteKey) {
			await this.storageService.delete(user.avatarKey);
		}

		const ext = file.mimetype.split('/')[1].replace('svg+xml', 'svg');
		const key = `avatars/${id}-${Date.now()}.${ext}`;
		await this.storageService.uploadFile(key, file.buffer, file.mimetype);

		await this.prismaService.user.update({
			where: { id },
			data: { avatarKey: key },
			omit: { password: true },
		});

		return { avatarUrl: this.storageService.getUrl(key) };
	}
}
