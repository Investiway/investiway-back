import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsObjectId } from '../validators/is-object-id.validate';

export class NoteSearchQuery {
  @ApiPropertyOptional()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObjectId()
  userId: string;
}

export class NoteGetOneParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class NoteDeleteParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class NoteCreateOrEditParams {
  @ApiProperty()
  @IsObjectId()
  id: string;
}

export class NoteCreateOrEditBody {
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
  @IsObjectId()
  userId: string;
}
