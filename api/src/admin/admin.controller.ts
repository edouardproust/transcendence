import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Query,
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
import { AdminUsersResponseDto } from './dtos/admin-users-response.dto';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { AdminService } from './admin.service';
import { AdminStatsResponseDto } from './dtos/admin-stats-response.dto';
import { AdminGamesQueryDto } from './dtos/admin-games-query.dto';
import { AdminGamesResponseDto } from './dtos/admin-games-response.dto';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { UpdateUserAdminDto } from '../users/dtos/update-user-admin.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiTags('admin')
@ApiBearerAuth()
export class AdminController {
	constructor(
		private readonly adminService: AdminService,
		private readonly usersService: UsersService,
	) {}

	// users

	@Get('users')
	@ApiOperation({ summary: 'Get paginated users list (admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns paginated users list',
		type: AdminUsersResponseDto,
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
	async getUsers(
		@Query() query: AdminUsersQueryDto,
	): Promise<AdminUsersResponseDto> {
		return this.adminService.getUsers(query);
	}

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
		description:
			'Admin role required | Admin cannot delete their own account',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User not found',
	})
	async deleteUser(
		@Param('id', ParseUUIDPipe) id: string,
		@CurrentUser() currentUser: RequestUser,
	): Promise<void> {
		if (currentUser.id === id) {
			throw new ForbiddenException(
				'Admin cannot delete their own account',
			);
		}
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
		await this.adminService.deleteGame(id);
	}

	@Get('games')
	@ApiOperation({ summary: 'Get paginated games list (admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns paginated games list',
		type: AdminGamesResponseDto,
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
	async getGames(
		@Query() query: AdminGamesQueryDto,
	): Promise<AdminGamesResponseDto> {
		return this.adminService.getGames(query);
	}

	@Get('stats')
	@ApiOperation({ summary: 'Get admin dashboard stats (admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns dashboard stats',
		type: AdminStatsResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Admin role required',
	})
	async getStats(): Promise<AdminStatsResponseDto> {
		return this.adminService.getStats();
	}
}
