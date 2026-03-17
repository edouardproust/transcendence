import {
	Controller,
	Delete,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
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

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiTags('admin')
@ApiBearerAuth()
export class AdminController {
	constructor(private readonly usersService: UsersService) {}

	@Delete('users/:userId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete user by id (admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		schema: { example: { message: 'User deleted' } },
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
	async deleteUser(@Param('userId', ParseUUIDPipe) userId: string) {
		await this.usersService.deleteOneById(userId);
		return { message: 'User deleted successfully' };
	}
}
