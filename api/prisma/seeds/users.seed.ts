import * as bcrypt from 'bcrypt';
import { Role } from '../../src/prisma/generated/enums';
import { PrismaClient, User } from '../../src/prisma/generated/client';
import { EXAMPLES } from '../../src/common/constants';

export const seedUsers = async (prisma: PrismaClient): Promise<User[]> => {
	const password = await bcrypt.hash(EXAMPLES.password, 10);
	const result: User[] = [];

	for (let i = 1; i <= 20; i++) {
		const user = await prisma.user.upsert({
			where: { email: `user${i}@example.com` },
			update: {},
			create: {
				email: `user${i}@example.com`,
				password,
				username: `user${i}`,
				role: Role.USER,
				elo: EXAMPLES.elo + i * 10,
			},
		});
		result.push(user);
	}

	console.log(`  ${result.length} users created`);
	return result;
};
