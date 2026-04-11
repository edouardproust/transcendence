import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService],
	imports: [PrismaModule, UsersModule],
	exports: [FriendsService],
})
export class FriendsModule {}
