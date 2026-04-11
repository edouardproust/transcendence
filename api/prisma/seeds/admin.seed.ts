import * as bcrypt from 'bcrypt';
import { Role } from '../../src/prisma/generated/enums';
import { PrismaClient, User } from '../../src/prisma/generated/client';
import { EXAMPLES } from '../../src/common/constants';

export const seedAdmin = async (prisma: PrismaClient): Promise<User> => {
	const password = await bcrypt.hash(
		process.env.SEED_ADMIN_PASSWORD ?? EXAMPLES.password,
		10,
	);

	const admin = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			email: 'admin@example.com',
			password,
			username: 'admin',
			role: Role.ADMIN,
		},
	});

	console.log(`  Admin created: ${admin.email}`);

	if (process.env.NODE_ENV === 'production') {
		console.log('  -------------------------------------');
		console.log('  Action required after first login:  ');
		console.log('  - Change admin username              ');
		console.log('  - Change admin email                 ');
		console.log('  -------------------------------------');
	}

	return admin;
};
