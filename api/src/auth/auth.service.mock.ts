import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

export const AuthServiceMock = {
	provide: AuthService,
	useValue: {
		register: jest.fn(),
		login: jest.fn(),
		logout: jest.fn(),
	},
};

export const JwtServiceMock = {
	provide: JwtService,
	useValue: {
		sign: jest.fn(),
	},
};
