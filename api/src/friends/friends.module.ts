import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService],
	imports: [PrismaModule],
})
export class FriendsModule {}
