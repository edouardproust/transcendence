import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/prisma/generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL!})
		super({adapter});
	}

	async onModuleInit() {
		try {
			await this.$connect();
			Logger.log("Database connection established");
		} catch(error) {
			Logger.error("Database connection failed", error);
			throw error;
		}
	}
}
