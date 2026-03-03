import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK) // Override default 201 status code for POST
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	/**
	 * @remarks
	 * Client-side must delete the JWT token upon calling this endpoint.
	 */
	@Post('logout')
	logout() {
		return this.authService.logout();
	}
}
