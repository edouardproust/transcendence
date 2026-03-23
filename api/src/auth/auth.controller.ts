import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { RequestUser } from './interfaces/request-user.interface';
import { UsersService } from '../users/users.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
	) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'User registered successfully',
		type: AuthResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'Email or username already taken',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input',
	})
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login with email or username and password' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User logged in successfully',
		type: AuthResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid credentials',
	})
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get current authenticated user' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns current authenticated user',
		type: UserResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	async me(@CurrentUser() user: RequestUser) {
		return this.usersService.findOneById(user.id);
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Logout current user' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User logged out successfully',
		schema: { example: { message: 'Logged out' } },
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid token',
	})
	logout() {
		return { message: 'Logged out' };
	}
}
