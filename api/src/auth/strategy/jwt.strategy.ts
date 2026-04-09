import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestUser } from '../interfaces/request-user.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET || 'secret',
		});
	}

	/**
	 * Validate the JWT payload and populates the @Request() object with the needed user informations.
	 *
	 * The returned object can hold more data depending on the needs of the application,
	 * but it should at least contain the user id and role for authorization purposes.
	 *
	 * @param payload The decoded JWT payload.
	 * @returns An object containing the needed user informations.
	 */
	async validate(payload: JwtPayload): Promise<RequestUser> {
		const user = await this.usersService.findOneById(payload.sub);
		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		return { id: user.id, role: user.role };
	}
}
