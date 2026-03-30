import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { StorageModule } from './storage/storage.module';
import { AdminModule } from './admin/admin.module';
import { FriendsModule } from './friends/friends.module';

@Module({
	imports: [
		UsersModule,
		AuthModule,
		GameModule,
		StorageModule,
		AdminModule,
		FriendsModule,
	],
})
export class AppModule {}
