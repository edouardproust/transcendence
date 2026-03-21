import { Role } from '../../prisma/generated/enums';
import { AdminGuard } from './admin.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('AdminGuard', () => {
	let guard: AdminGuard;

	beforeEach(() => {
		guard = new AdminGuard();
	});

	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	const mockContext = (role: Role) =>
		({
			switchToHttp: () => ({
				getRequest: () => ({
					user: { role },
				}),
			}),
		}) as ExecutionContext;

	describe('canActivate', () => {
		it('should return true when user is ADMIN', () => {
			const result = guard.canActivate(mockContext(Role.admin));
			expect(result).toBe(true);
		});

		it('should throw ForbiddenException when user is not ADMIN', () => {
			expect(() => guard.canActivate(mockContext(Role.user))).toThrow(
				ForbiddenException,
			);
		});
	});
});
