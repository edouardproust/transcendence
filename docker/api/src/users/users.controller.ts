import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {

	@Get()
	findAll() {
		return 'This is the response from the nestJS API for the /users endpoint!';
	}

}
