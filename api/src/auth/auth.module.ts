import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	imports: [
		UsersModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'secret',
			signOptions: { expiresIn: '1d' },
		}),
	],
	exports: [JwtModule],
})
export class AuthModule {}
