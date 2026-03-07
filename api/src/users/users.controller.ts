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
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';

@Controller('users') // /users
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
	constructor(private readonly service: UsersService) {}

	@Get()
	@UseGuards(JwtAuthGuard, AdminGuard)
	@ApiOperation({ summary: 'Get all users (admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns list of users',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Admin role required',
	})
	async findAll() {
		return this.service.findAll();
	}

	@Get(':id') // /users/12
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	@ApiOperation({ summary: 'Get user by id (owner or admin only)' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Returns user data' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Owner or admin role required',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User not found',
	})
	async findOneById(@Param('id', ParseIntPipe) id: number) {
		const user = await this.service.findOneById(id);
		if (!user) {
			throw new NotFoundException(`User not found`);
		}
		return user;
	}

	@Delete(':id') // DELETE /users/12
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	@HttpCode(HttpStatus.NO_CONTENT) // Override default 200 status code for DELETE
	@ApiOperation({ summary: 'Delete user by id (owner or admin only)' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'User deleted successfully',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Owner or admin role required',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User not found',
	})
	async deleteOne(@Param('id', ParseIntPipe) id: number) {
		return this.service.deleteOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	@ApiOperation({ summary: 'Update user by id (owner or admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns updated user data',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Owner or admin role required',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User not found',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input',
	})
	async updateOne(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.service.updateOneById(id, updateUserDto);
	}
}
