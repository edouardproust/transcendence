import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../prisma/generated/enums';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Generate a JWT token for the given user.
	 *
	 * The payload contains only 2 fields to keep the token minimal:
	 * - `id` (user id): required by `OwnerOrAdminGuard` to compare with `params.id`
	 * - `role` (user role): required by `AdminGuard` to check for admin access
	 */
	private generateToken(payload: JwtPayload): string {
		return this.jwtService.sign({
			sub: payload.sub,
			role: payload.role,
		});
	}

	/**
	 * Create a new user in database, then and log him in by generating a JWT token.
	 *
	 * @param createUserDto POST user data
	 * @returns Object containing JWT `token` & `user` data (password omitted for security)
	 * @throws {ConflictException} If email or username already exists
	 */
	async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
		const userWithoutPassword =
			await this.usersService.createOne(createUserDto);
		return {
			user: userWithoutPassword,
			token: this.generateToken({
				sub: userWithoutPassword.id,
				role: userWithoutPassword.role,
			}),
		};
	}

	/**
	 * Login a user by generating a JWT token.
	 *
	 * @param loginDto Post data for login
	 * @returns Object containing JWT `token` & `user` data (password omitted for security)
	 * @throws UnauthorizedException if email or password is invalid
	 */
	async login(loginDto: LoginDto): Promise<AuthResponseDto> {
		const errorMsg = 'Invalid email, username or password'; // Vague to give no info to attackers
		const isEmail = /\S+@\S+\.\S+/.test(loginDto.emailOrUsername);

		let user = isEmail
			? await this.usersService.findOneByEmail(loginDto.emailOrUsername)
			: await this.usersService.findOneByUsername(
					loginDto.emailOrUsername,
				);
		if (!user) throw new UnauthorizedException(errorMsg);

		if (!(await bcrypt.compare(loginDto.password, user.password)))
			throw new UnauthorizedException(errorMsg);

		const { password, ...userWithoutPassword } = user;
		return {
			user: userWithoutPassword,
			token: this.generateToken({
				sub: userWithoutPassword.id,
				role: userWithoutPassword.role,
			}),
		};
	}
}
