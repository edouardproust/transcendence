import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './ws-jwt.guard';

describe('WsJwtGuard', () => {
	let guard: WsJwtGuard;
	let jwtService: JwtService;

	const mockClient = {
		handshake: {
			auth: {},
			headers: {},
		},
		data: {} as Record<string, any>,
		disconnect: jest.fn(),
	};

	const mockContext = {
		switchToWs: () => ({
			getClient: () => mockClient,
		}),
	} as unknown as ExecutionContext;

	beforeEach(() => {
		jwtService = { verify: jest.fn() } as unknown as JwtService;
		guard = new WsJwtGuard(jwtService);
		jest.clearAllMocks();
		mockClient.handshake.auth = {};
		mockClient.handshake.headers = {};
		mockClient.data = {};
	});

	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	it('should return true and attach user when token is valid in auth', () => {
		const payload = { sub: 'user-id', role: 'USER' };
		mockClient.handshake.auth = { token: 'valid-token' };
		jest.spyOn(jwtService, 'verify').mockReturnValue(payload as any);

		const result = guard.canActivate(mockContext);

		expect(result).toBe(true);
		expect(mockClient.data.user).toEqual(payload);
		expect(mockClient.disconnect).not.toHaveBeenCalled();
	});

	it('should return true when token is in Authorization header', () => {
		const payload = { sub: 'user-id', role: 'USER' };
		mockClient.handshake.headers = { authorization: 'Bearer valid-token' };
		jest.spyOn(jwtService, 'verify').mockReturnValue(payload as any);

		const result = guard.canActivate(mockContext);

		expect(result).toBe(true);
		expect(mockClient.data.user).toEqual(payload);
	});

	it('should disconnect and return false when no token', () => {
		const result = guard.canActivate(mockContext);

		expect(result).toBe(false);
		expect(mockClient.disconnect).toHaveBeenCalled();
	});

	it('should disconnect and return false when token is invalid', () => {
		mockClient.handshake.auth = { token: 'invalid-token' };
		jest.spyOn(jwtService, 'verify').mockImplementation(() => {
			throw new Error('invalid token');
		});

		const result = guard.canActivate(mockContext);

		expect(result).toBe(false);
		expect(mockClient.disconnect).toHaveBeenCalled();
	});
});
