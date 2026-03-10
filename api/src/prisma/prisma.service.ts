import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		const adapter = new PrismaPg({
			connectionString: process.env.DATABASE_URL!,
		});
		super({ adapter });
	}

	/**
	 * Establish DB connexion when app starts.
	 */
	async onModuleInit() {
		try {
			await this.$connect();
			Logger.log('Database connection established');
		} catch (error) {
			Logger.error('Database connection failed', error);
			throw error;
		}
	}

	/**
	 * Properly close DB connexion when app stops, to prevent connexions leaks in prod.
	 */
	async onModuleDestroy() {
		await this.$disconnect();
		Logger.log('Database connection closed');
	}
}
