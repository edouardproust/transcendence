import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	controllers: [AdminController],
	providers: [AdminService],
	imports: [UsersModule, PrismaModule],
})
export class AdminModule {}
