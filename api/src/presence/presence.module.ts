import { Module } from '@nestjs/common';
import { PresenceGateway } from './presence.gateway';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [
		UsersModule,
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'your-secret-key',
			signOptions: { expiresIn: '7d' },
		}),
	],
	providers: [PresenceGateway],
	exports: [PresenceGateway],
})
export class PresenceModule {}
