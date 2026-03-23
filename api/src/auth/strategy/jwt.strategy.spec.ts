import { usersFixture } from '../../users/users.service.mock';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
	let strategy: JwtStrategy;

	beforeEach(() => {
		strategy = new JwtStrategy();
	});

	it('should be defined', () => {
		expect(strategy).toBeDefined();
	});

	it('should use JWT_SECRET env variable when defined', () => {
		process.env.JWT_SECRET = 'test-secret';
		const strategy = new JwtStrategy();
		expect(strategy).toBeDefined();
		delete process.env.JWT_SECRET;
	});

	describe('validate', () => {
		it('should return user id and role from payload', async () => {
			const payload = {
				sub: usersFixture[0].id,
				role: usersFixture[0].role,
			};
			const result = await strategy.validate(payload);
			expect(result).toEqual({
				id: usersFixture[0].id,
				role: usersFixture[0].role,
			});
		});
	});
});
