import * as bcrypt from 'bcrypt';
import { Role } from '../src/prisma/generated/enums';
import { PrismaClient, User } from '../src/prisma/generated/client';

export const seedUsers = async (prisma: PrismaClient) => {
	const result: User[] = [];

	const user = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			email: 'admin@example.com',
			password: await bcrypt.hash('admin1234', 10),
			username: 'admin',
			role: Role.ADMIN,
		},
	});
	result.push(user);

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
		result.push(user);
	}

	return result;
};
