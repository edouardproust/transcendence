import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Role } from '../../prisma/generated/enums';

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (user.role === Role.admin) return true;

		throw new ForbiddenException(
			"You don't have permission to access this resource",
		);
	}
}
