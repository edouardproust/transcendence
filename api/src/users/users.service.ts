import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';

@Injectable()
export class UsersService {
	findAll() {
		console.log(`TODO: find all users`);
	}

	findOne(id: number) {
		console.log(`TODO: Find user with id ${id}`);
	}

	create(createUserDto: CreateUserDto) {
		console.log(
			`TODO: Create user with the following data: ${JSON.stringify(createUserDto)}`,
		);
	}

	remove(id: number) {
		console.log(`TODO: Remove user with id ${id}`);
	}
}
