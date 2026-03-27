import { PrismaClient } from '../src/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedGames, seedUsers } from './seed-data';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	await prisma.game.deleteMany();
	await prisma.user.deleteMany();
	const users = await seedUsers(prisma);
	const games = await seedGames(prisma, users);
	return { users, games };
}

main()
	.then(({ users, games }) => {
		console.log(`Seeded ${users.length} users and ${games.length} games`);
	})
	.catch(console.error)
	.finally(() => prisma.$disconnect());
