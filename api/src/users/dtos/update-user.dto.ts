import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	// We use PartialType form Swagger:
	// this adds @ApiProperty({required: false}) to all properties
}
