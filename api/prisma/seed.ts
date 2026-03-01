import * as bcrypt from 'bcrypt';
import { Role } from '../src/prisma/generated/enums';
import { PrismaClient } from '../src/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	// Clean up existing data
	await prisma.user.deleteMany();
	console.log('Existing users deleted');

	// Create admin
	// (upsert: if user already exists, do nothing; if not, create it)
	const admin = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			email: 'admin@example.com',
			password: await bcrypt.hash('admin1234', 10),
			username: 'admin',
			role: Role.ADMIN,
		},
	});
	console.log('Admin created:', admin);

	// Create 5 test users
	for (let i = 1; i <= 5; i++) {
		const user = await prisma.user.upsert({
			where: { email: `test${i}@example.com` },
			update: {},
			create: {
				email: `test${i}@example.com`,
				password: await bcrypt.hash('test123456789', 10),
				username: `test${i}`,
				role: Role.USER,
			},
		});
		console.log('User created:', user);
	}
}

main()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
