import { PrismaClient } from '../src/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedUsers } from './seed-data';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	await prisma.user.deleteMany();
	const users = await seedUsers(prisma);
	return users;
}

main()
	.then((users) => console.log('Saved data to database:', users))
	.catch(console.error)
	.finally(() => prisma.$disconnect());
