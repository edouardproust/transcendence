import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	NotFoundException,
	Param,
	ParseFilePipe,
	ParseUUIDPipe,
	Patch,
	Query,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { OwnerOrAdminGuard } from '../auth/guard/owner-or-admin.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { UserProfileResponseDto } from './dtos/user-profile-response.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { SearchUsersDto } from './dtos/search-users.dto';
import { UserPublicResponseDto } from './dtos/user-public-response.dto';
import { UserPublicProfileResponseDto } from './dtos/user-public-profile-response.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedAvatar } from './decorators/uploaded-avatar.decorator';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// several users

	@Get()
	@UseGuards(JwtAuthGuard, AdminGuard)
	@ApiOperation({ summary: 'Get all users (admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns list of users',
		type: [UserResponseDto],
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Admin role required',
	})
	async findAll(): Promise<UserResponseDto[]> {
		return this.usersService.findAll();
	}

	@Get('search')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Search users by username' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns list of matching users',
		type: [UserPublicResponseDto],
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Query must be at least 2 characters',
	})
	async search(
		@Query() query: SearchUsersDto,
	): Promise<UserPublicResponseDto[]> {
		return this.usersService.search(query.query);
	}

	// profile (user model + games data related to this user)

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get own profile' })
	@ApiResponse({
		status: HttpStatus.OK,
		description:
			'Returns current authenticated user profile with game stats',
		type: UserProfileResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	async getOwnProfile(
		@CurrentUser() user: RequestUser,
	): Promise<UserProfileResponseDto> {
		return this.usersService.findProfileById(user.id, true);
	}

	@Get('profile/:id')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get user profile by id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns user profile with game stats',
		type: UserPublicProfileResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'User not found',
	})
	async getProfileById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<UserPublicProfileResponseDto> {
		return this.usersService.findProfileById(id);
	}

	@Patch('profile')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Update own profile' })
	@ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input',
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'Email or username already taken',
	})
	async updateProfile(
		@CurrentUser() user: RequestUser,
		@Body() dto: UpdateProfileDto,
	): Promise<UserResponseDto> {
		return this.usersService.updateOneById(user.id, dto);
	}

	// user avatar

	@Patch('avatar')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('avatar'))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Upload avatar for current user' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				avatar: { type: 'string', format: 'binary' },
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Avatar updated successfully',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid file',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	async uploadAvatar(
		@CurrentUser() user: RequestUser,
		@UploadedAvatar() file: Express.Multer.File,
	): Promise<{ avatarUrl: string }> {
		return this.usersService.uploadAvatar(user.id, file);
	}

	// user standard crud

	@Get(':id')
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	@ApiOperation({ summary: 'Get user by id (owner or admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns user data',
		type: UserResponseDto,
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
	async findOneById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<UserResponseDto> {
		const user = await this.usersService.findOneById(id);
		if (!user) {
			throw new NotFoundException(`User not found`);
		}
		return user;
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
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
	async deleteOne(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.usersService.deleteOneById(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
	@ApiOperation({ summary: 'Update user by id (owner or admin only)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns updated user data',
		type: UserResponseDto,
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
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<UserResponseDto> {
		return this.usersService.updateOneById(id, updateUserDto);
	}
}
