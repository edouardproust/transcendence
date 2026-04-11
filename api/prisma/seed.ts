import { PrismaClient } from '../src/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedAdmin } from './seeds/admin.seed';
import { seedUsers } from './seeds/users.seed';
import { seedGames } from './seeds/games.seed';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
	const isProd = process.env.NODE_ENV === 'production';

	console.log(
		`\nSeeding in ${isProd ? 'production' : 'development'} mode...`,
	);

	if (isProd) {
		// production: admin only, password from env
		const admin = await seedAdmin(prisma);
		console.log(`\nDone. Admin: ${admin.email}`);
	} else {
		// development: full dataset for eval/testing
		await prisma.game.deleteMany();
		await prisma.user.deleteMany();

		const admin = await seedAdmin(prisma);
		const users = await seedUsers(prisma);
		//const games = await seedGames(prisma, admin, users);

		console.log(
			`\nDone. ${1 + users.length} users, ${games.length} games created.`,
		);
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
