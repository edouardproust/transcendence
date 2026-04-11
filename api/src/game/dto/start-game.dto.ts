import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class StartGameDto {
	@ApiPropertyOptional({ example: 'white', enum: ['white', 'black'] })
	@IsOptional()
	@IsIn(['white', 'black'])
	playerColor?: 'white' | 'black';
}
