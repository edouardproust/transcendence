import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UpdateUserAdminDto } from '../users/dto/update-user-admin.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiTags('admin')
@ApiBearerAuth()
export class AdminController {
	constructor(private readonly usersService: UsersService) {}

	// users

	@Patch('users/:id')
	@ApiOperation({ summary: 'Update user elo or role (admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns updated user',
		type: UserResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Admin role required',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User not found',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input',
	})
	async updateUser(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateUserAdminDto,
	): Promise<UserResponseDto> {
		return this.usersService.updateOneById(id, dto);
	}

	@Delete('users/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete user by id (admin only)' })
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
		description: 'Admin role required',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User not found',
	})
	async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.usersService.deleteOneById(id);
	}

	// games

	@Delete('games/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete game by id (admin only)' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Game deleted successfully',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Admin role required',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Game not found',
	})
	async deleteGame(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		// TODO: implement when games module is ready
	}

	@Get('games')
	@ApiOperation({ summary: 'Get paginated games list (admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns paginated games list',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Admin role required',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid query params',
	})
	async getGames(): Promise<void> {
		// TODO: implement when games module is ready
	}
}
