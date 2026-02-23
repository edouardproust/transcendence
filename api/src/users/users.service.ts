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

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll() {
		return this.prisma.user.findMany();
	}

	async findOneById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});
		if (!user) {
			throw new NotFoundException(`User with id ${id} was not found`);
		}
		return user;
	}

	async createOne(createUserDto: CreateUserDto) {
		return await this.prisma.user
			.create({ data: createUserDto })
			.catch((error) => {
				if (isPrismaError(error, PrismaErrorCode.UNIQUE_CONSTRAINT)) {
					throw new ConflictException(
						`A user with the same ${getUniqueConstraintFields(error).join(', ')} already exist`,
					);
				}
				throw error;
			});
	}

	async deleteOne(id: number) {
		await this.prisma.user.delete({ where: { id } }).catch((error) => {
			if (isPrismaError(error, PrismaErrorCode.NOT_FOUND)) {
				throw new NotFoundException(
					`User with id ${id} was not found.`,
				);
			}
			throw error;
		});
	}

	async updateOneById(id: number, updateUserDto: UpdateUserDto) {
		await this.prisma.user
			.update({ where: { id }, data: updateUserDto })
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
