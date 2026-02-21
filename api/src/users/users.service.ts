import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUniqueConstraintError } from 'src/prisma/prisma.error';
import { userInfo } from 'os';

@Injectable()
export class UsersService
{
	constructor(private readonly prisma: PrismaService) {}

	findAll() {
		return this.prisma.user.findMany();
	}

	async findOneById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id }
		});
		if (!user) {
			throw new NotFoundException(`User with id ${id} was not found`);
		}
		return user;
	}

	async createOne(userData: CreateUserDto) {
		const user =  await this.prisma.user
			.create({ data: userData })
			.catch((error) => {
				if (isUniqueConstraintError(error)) {
					const fields: string = error.meta?.driverAdapterError?.cause?.constraint?.fields.join(', ');
					throw new ConflictException(`A user with the same ${fields} already exist`);
				}
				throw new InternalServerErrorException();
			});
		return user;
	}

	async deleteOne(id: number) {
		return await this.prisma.user
			.delete({ where: { id: id }});
	}

	updateOne(id: string, userData: CreateUserDto) {
		return `Update user with id ${id} with data: ${JSON.stringify(userData)}`;
	}
}
