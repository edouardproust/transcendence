import { ApiProperty } from '@nestjs/swagger';
import { DEFAULTS } from '../../common/constants';

export class PaginationDto {
	@ApiProperty({ example: 100 })
	total: number;

	@ApiProperty({ example: DEFAULTS.pagination.page })
	page: number;

	@ApiProperty({ example: DEFAULTS.pagination.limit })
	limit: number;

	@ApiProperty({ example: 5 })
	totalPages: number;
}
