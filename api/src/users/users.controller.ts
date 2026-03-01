import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	ParseIntPipe,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { OwnerOrAdminGuard } from '../auth/guard/owner-or-admin.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AdminGuard } from '../auth/guard/admin.guard';

@Controller('users')
export class UsersController {
	constructor(private readonly service: UsersService) {}

	@Get()
	@UseGuards(JwtAuthGuard, AdminGuard)
	async findAll() {
		return this.service.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	async findOneById(@Param('id', ParseIntPipe) id: number) {
		const user = await this.service.findOneById(id);
		if (!user) {
			throw new NotFoundException(`User #${id} not found`);
		}
		return user;
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	@HttpCode(HttpStatus.NO_CONTENT) // Override default 200 status code for DELETE
	async deleteOne(@Param('id', ParseIntPipe) id: number) {
		return this.service.deleteOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	async updateOne(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.service.updateOneById(id, updateUserDto);
	}
}
