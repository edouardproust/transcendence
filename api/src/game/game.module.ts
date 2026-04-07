import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GameGateway } from './game.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [PrismaModule, AuthModule, UsersModule],
	controllers: [GameController],
	providers: [GameService, GameGateway],
})
export class GameModule {}
