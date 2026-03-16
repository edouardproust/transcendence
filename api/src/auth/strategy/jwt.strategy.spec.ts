import { Role } from '../../prisma/generated/enums';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
	let strategy: JwtStrategy;

	beforeEach(() => {
		strategy = new JwtStrategy();
	});

	it('should be defined', () => {
		expect(strategy).toBeDefined();
	});

	describe('validate', () => {
		it('should return user id and role from payload', async () => {
			const payload = { sub: 1, role: Role.admin };
			const result = await strategy.validate(payload);
			expect(result).toEqual({ id: 1, role: Role.admin });
		});
	});
});
