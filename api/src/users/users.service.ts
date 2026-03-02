import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
	getUniqueConstraintFields,
	isPrismaError,
	PrismaErrorCode,
} from '../prisma/prisma.error';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(private readonly prismaService: PrismaService) {}

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
	async findOneById(id: number) {
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
	async deleteOne(id: number) {
		return this.prismaService.user
			.delete({ where: { id }, omit: { password: true } })
			.catch((error) => {
				if (isPrismaError(error, PrismaErrorCode.NOT_FOUND)) {
					throw new NotFoundException(
						`User with id ${id} was not found.`,
					);
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
	async updateOneById(id: number, updateUserDto: UpdateUserDto) {
		const data = updateUserDto.password
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
					throw new NotFoundException(
						`User with id ${id} was not found.`,
					);
				}
				if (isPrismaError(error, PrismaErrorCode.UNIQUE_CONSTRAINT)) {
					throw new ConflictException(
						`A user with the same ${getUniqueConstraintFields(error).join(', ')} already exist`,
					);
				}
				throw error;
			});
	}
}
