import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController
{
	constructor(private readonly service: UsersService) {}
	
	@Get()
	findAll() {
		return this.service.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.service.findOneById(id);
	}

	@Post()
	createOne(@Body() userData: CreateUserDto) {
		return this.service.createOne(userData);
	}

	@Delete(':id')
	deleteOne(@Param('id', ParseIntPipe) id: number) {
		return this.service.deleteOne(id);
	}

	@Put(':id')
	updateOne(@Param('id') id: string, @Body() userData: CreateUserDto) {
		return `Update user with id ${id} with data: ${JSON.stringify(userData)}`;
	}
}
