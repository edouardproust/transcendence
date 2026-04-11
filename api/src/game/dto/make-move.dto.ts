import {
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MoveDto {
	@IsString()
	@IsNotEmpty()
	from: string;

	@IsString()
	@IsNotEmpty()
	to: string;

	@IsOptional()
	@IsString()
	promotion?: string;
}

export class MakeMoveDto {
	@IsNotEmpty()
	@ValidateNested()
	@Type(() => MoveDto)
	move: MoveDto;
}
