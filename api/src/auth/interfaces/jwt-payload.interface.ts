import { Role } from '../../prisma/generated/enums';

export interface JwtPayload {
	sub: string; // subject = user id
	role: Role; // user role
}
