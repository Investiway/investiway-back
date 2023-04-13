import { ApiProperty } from '@nestjs/swagger';

export class SchemaDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  updatedAt: string;
}

export class SchemaUpdateDto {
  @ApiProperty()
  acknowledged: boolean;

  @ApiProperty()
  modifiedCount: number;

  @ApiProperty()
  upsertedCount: number;

  @ApiProperty()
  matchedCount: number;
}
