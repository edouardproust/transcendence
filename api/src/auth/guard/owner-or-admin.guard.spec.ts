import { OwnerOrAdminGuard } from './owner-or-admin.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../../prisma/generated/enums';

describe('OwnerOrAdminGuard', () => {
	let guard: OwnerOrAdminGuard;

	beforeEach(() => {
		guard = new OwnerOrAdminGuard();
	});

	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	const mockContext = (role: Role, userId: number, paramId: string) =>
		({
			switchToHttp: () => ({
				getRequest: () => ({
					user: { role, id: userId },
					params: { id: paramId },
				}),
			}),
		}) as ExecutionContext;

	describe('canActivate', () => {
		it('should return true when user is ADMIN', () => {
			const result = guard.canActivate(mockContext(Role.ADMIN, 2, '1'));
			expect(result).toBe(true);
		});

		it('should return true when user is owner', () => {
			const result = guard.canActivate(mockContext(Role.USER, 1, '1'));
			expect(result).toBe(true);
		});

		it('should throw ForbiddenException when user is not ADMIN nor owner', () => {
			expect(() =>
				guard.canActivate(mockContext(Role.USER, 2, '1')),
			).toThrow(ForbiddenException);
		});
	});
});
