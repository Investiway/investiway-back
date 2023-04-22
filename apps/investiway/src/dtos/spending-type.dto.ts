import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsObjectId } from '../validators/is-object-id.validate';

export enum ESpendingTypeIsSystem {
  None = 0,
  True = 1,
  False = 2,
}

export class SpendingTypeSearchQuery {
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

  @ApiPropertyOptional({ enum: ESpendingTypeIsSystem })
  @IsOptional()
  @IsEnum(ESpendingTypeIsSystem)
  isSystem: ESpendingTypeIsSystem;
}

export class SpendingTypeGetOneParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class SpendingTypeDeleteParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class SpendingTypeCreateOrEditParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class SpendingTypeCreateOrEditBody {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsObjectId()
  userId: string;
}
