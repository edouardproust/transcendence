import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../prisma/generated/enums';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	private generateToken(user: { id: number; role: Role }) {
		return this.jwtService.sign({ sub: user.id, role: user.role });
	}

	/**
	 * Create a new user in database, then and log him in by generating a JWT token.
	 *
	 * @param createUserDto
	 * @returns
	 * @throws
	 */
	async register(createUserDto: CreateUserDto) {
		const user = await this.usersService.createOne(createUserDto);
		return {
			user,
			access_token: this.generateToken(user),
		};
	}

	/**
	 * Login a user by generating a JWT token.
	 *
	 * @param loginDto Post data for login
	 * @returns Object containing JWT `access_token` & `user` data (password omitted for security)
	 * @throws UnauthorizedException if email or password is invalid
	 *
	 * @remarks
	 * The JWT payload contains only 3 fields to keep the token minimal:
	 * - `sub` (user id): required by `OwnerOrAdminGuard` to compare with `params.id`
	 * - `role`: required by `RolesGuard` to check for admin access
	 */
	async login(loginDto: LoginDto) {
		const errorMsg = 'Invalid email or password'; // Vague to give no info to attackers
		const user = await this.usersService.findOneByEmail(loginDto.email);
		if (!user) throw new UnauthorizedException(errorMsg);
		if (!(await bcrypt.compare(loginDto.password, user.password)))
			throw new UnauthorizedException(errorMsg);

		const { password, ...userWithoutPassword } = user;
		return {
			user: userWithoutPassword,
			access_token: this.generateToken(userWithoutPassword),
		};
	}

	/**
	 * Logout a user.
	 *
	 * @remarks
	 * No server-side logic needed for now. Since we use stateless JWT, logout is handled
	 * client-side by deleting the token. A blacklist or refresh token strategy can be
	 * implemented later if token revocation is required.
	 */
	logout() {}
}
