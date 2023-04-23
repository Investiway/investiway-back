import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsObjectId } from '../validators/is-object-id.validate';
import { MAX_NUMBER } from 'src/utils/common.util';

export class SpendingExtends {
  @ApiProperty()
  spendingTypeName: string;
}

export class SpendingSearchQuery {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObjectId()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObjectId()
  spendingTypeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate: string;
}

export class SpendingGetOneParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class SpendingDeleteParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class SpendingCreateOrEditParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class SpendingCreateOrEditBody {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1024)
  description: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(MAX_NUMBER)
  amount: number;

  @ApiProperty()
  @IsObjectId()
  spendingTypeId: string;

  @ApiProperty()
  @IsObjectId()
  userId: string;
}
