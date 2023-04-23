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

export class GoalExtends {
  @ApiProperty()
  goalTypeName: string;
}

export class GoalSearchQuery {
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
  goalTypeId: string;
}

export class GoalGetOneParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class GoalDeleteParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class GoalCreateOrEditParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class GoalCreateOrEditBody {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name: string;

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
  amountTarget: number;

  @ApiProperty()
  @IsDateString()
  completeDate: Date;

  @ApiProperty()
  @IsObjectId()
  goalTypeId: string;

  @ApiProperty()
  @IsObjectId()
  userId: string;
}
