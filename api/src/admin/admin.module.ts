import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
	controllers: [AdminController],
	providers: [AdminService],
	imports: [UsersModule],
})
export class AdminModule {}
