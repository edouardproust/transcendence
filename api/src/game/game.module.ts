import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GameGateway } from './game.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { FriendsModule } from '../friends/friends.module';
import { PresenceModule } from '../presence/presence.module';

@Module({
	imports: [
		PrismaModule,
		AuthModule,
		UsersModule,
		FriendsModule,
		PresenceModule,
	],
	controllers: [GameController],
	providers: [GameService, GameGateway],
})
export class GameModule {}
