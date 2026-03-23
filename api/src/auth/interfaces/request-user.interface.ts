import { Role } from '../../prisma/generated/enums';

export interface RequestUser {
	id: string; // user id
	role: Role; // user role
}
