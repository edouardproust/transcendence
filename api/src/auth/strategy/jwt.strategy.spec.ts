import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../../prisma/generated/enums';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
	let strategy: JwtStrategy;
	let usersService: { findOneById: jest.Mock };
	const mockUser = {
		id: 'user-123',
		role: Role.USER,
	};

	beforeEach(() => {
		usersService = {
			findOneById: jest.fn().mockResolvedValue(mockUser),
		};
		strategy = new JwtStrategy(usersService as never);
	});

	it('should be defined', () => {
		expect(strategy).toBeDefined();
	});

	it('should use JWT_SECRET env variable when defined', () => {
		process.env.JWT_SECRET = 'test-secret';
		const strategy = new JwtStrategy(usersService as never);
		expect(strategy).toBeDefined();
		delete process.env.JWT_SECRET;
	});

	describe('validate', () => {
		it('should return user id and role from database', async () => {
			const payload = {
				sub: mockUser.id,
				role: mockUser.role,
			};
			const result = await strategy.validate(payload);

			expect(usersService.findOneById).toHaveBeenCalledWith(mockUser.id);
			expect(result).toEqual({
				id: mockUser.id,
				role: mockUser.role,
			});
		});

		it('should throw UnauthorizedException when user does not exist', async () => {
			usersService.findOneById.mockResolvedValueOnce(null);

			await expect(
				strategy.validate({
					sub: mockUser.id,
					role: mockUser.role,
				}),
			).rejects.toThrow(UnauthorizedException);
		});
	});
});
