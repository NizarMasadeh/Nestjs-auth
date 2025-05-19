import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumberString } from 'class-validator';

export class QueryDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items per page',
  })
  @IsOptional()
  @IsNumberString()
  limit?: number;
}
