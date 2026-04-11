import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Role } from '../../prisma/generated/enums';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const id = request.params.id;

		if (user.role === Role.ADMIN || user.id === id) return true;

		throw new ForbiddenException(
			"You don't have permission to access this resource",
		);
	}
}
