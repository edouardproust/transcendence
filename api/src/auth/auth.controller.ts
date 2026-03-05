import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * @remark No route for logout: JWT token deletion is handled client-side
 */
@Controller('auth')
@ApiTags('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'User registered successfully',
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'Email already registered',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input',
	})
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}

	@Post('login')
	@ApiOperation({ summary: 'Login with email and password' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Returns JWT token' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid credentials',
	})
	@HttpCode(HttpStatus.OK) // Override default 201 status code for POST
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}
}
