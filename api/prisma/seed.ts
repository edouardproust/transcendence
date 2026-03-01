import * as bcrypt from 'bcrypt';
import { Role } from '../src/prisma/generated/enums';
import { PrismaClient } from '../src/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	const admin = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			email: 'admin@example.com',
			password: await bcrypt.hash('admin1234', 10),
			role: Role.ADMIN,
		},
	});
	console.log('Admin created:', admin);
}

main()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
