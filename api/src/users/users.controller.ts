import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly service: UsersService) {}

	@Get()
	async findAll() {
		return this.service.findAll();
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.service.findOneById(id);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async createOne(@Body() createUserDto: CreateUserDto) {
		return this.service.createOne(createUserDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteOne(@Param('id', ParseIntPipe) id: number) {
		return this.service.deleteOne(id);
	}

	@Patch(':id')
	async updateOne(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.service.updateOneById(id, updateUserDto);
	}
}
