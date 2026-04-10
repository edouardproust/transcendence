import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Chess } from 'chess.js';
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

	private getPgnResultToken(pgn: string | null | undefined) {
		const trimmed = String(pgn ?? '').trim();
		if (!trimmed) return null;

		const tokens = trimmed.split(/\s+/);
		const lastToken = tokens[tokens.length - 1];

		return lastToken === '1-0' ||
			lastToken === '0-1' ||
			lastToken === '1/2-1/2'
			? lastToken
			: null;
	}

	private loadFinishedGameState(game: {
		currentFen: string;
		pgn: string;
	}) {
		const chess = new Chess();

		try {
			if (game.pgn?.trim()) {
				chess.loadPgn(game.pgn);
				return chess;
			}
		} catch {}

		try {
			if (game.currentFen?.trim()) {
				chess.load(game.currentFen);
				return chess;
			}
		} catch {}

		return null;
	}

	private classifyFinishedGameOutcome(
		game: {
			whiteId: string | null;
			blackId: string | null;
			winnerId: string | null;
			currentFen: string;
			pgn: string;
		},
		userId: string,
	): 'win' | 'loss' | 'draw' {
		if (game.winnerId === userId) {
			return 'win';
		}

		if (game.winnerId && game.winnerId !== userId) {
			return 'loss';
		}

		const playerSide =
			game.whiteId === userId ? 'w' : game.blackId === userId ? 'b' : null;
		const resultToken = this.getPgnResultToken(game.pgn);

		if (resultToken === '1/2-1/2') {
			return 'draw';
		}

		if (playerSide && resultToken === '1-0') {
			return playerSide === 'w' ? 'win' : 'loss';
		}

		if (playerSide && resultToken === '0-1') {
			return playerSide === 'b' ? 'win' : 'loss';
		}

		const chess = this.loadFinishedGameState(game);
		if (!chess) {
			return 'draw';
		}

		if (playerSide && chess.isCheckmate()) {
			return chess.turn() === playerSide ? 'loss' : 'win';
		}

		if (
			chess.isDraw() ||
			chess.isStalemate() ||
			chess.isInsufficientMaterial() ||
			chess.isThreefoldRepetition()
		) {
			return 'draw';
		}

		return 'draw';
	}

	mapUser(user: {
		username: string;
		elo: number;
		avatarKey?: string;
		isOnline?: boolean;
		lastSeen?: Date | null;
	}): any {
		if ('avatarKey' in user) {
			const { avatarKey, ...rest } = user;
			return {
				...rest,
				avatarUrl: avatarKey
					? this.storageService.getUrl(avatarKey)
					: null,
			};
		}

		return {
			...user,
			avatarUrl: null,
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

		const finishedGames = await this.prismaService.game.findMany({
			where: {
				OR: [{ whiteId: id }, { blackId: id }],
				status: GameStatus.FINISHED,
			},
			select: {
				whiteId: true,
				blackId: true,
				winnerId: true,
				currentFen: true,
				pgn: true,
			},
		});

		let wins = 0;
		let draws = 0;

		for (const game of finishedGames) {
			const outcome = this.classifyFinishedGameOutcome(game, id);

			if (outcome === 'win') wins += 1;
			if (outcome === 'draw') draws += 1;
		}

		const totalGames = finishedGames.length;

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
