import {ApiProperty} from "@nestjs/swagger";

export class SchemaDto {
  @ApiProperty()
  _id: string;
  
  @ApiProperty()
  updatedAt: string
}