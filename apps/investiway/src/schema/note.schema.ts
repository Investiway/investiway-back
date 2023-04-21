import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { SchemaDto } from '../dtos/schema.dto';
import { ApiProperty } from '@nestjs/swagger';

export type NoteDocument = HydratedDocument<Note>;

@Schema({
  timestamps: true,
})
export class Note extends SchemaDto {
  @ApiProperty()
  @Prop()
  name: string;

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId })
  userId: ObjectId;

  @ApiProperty({ type: Date })
  @Prop()
  deleteAt: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
