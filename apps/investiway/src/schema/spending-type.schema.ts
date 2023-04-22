import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { SchemaDto } from '../dtos/schema.dto';
import { ApiProperty } from '@nestjs/swagger';

export type SpendingTypeDocument = HydratedDocument<SpendingType>;

@Schema({
  timestamps: true,
})
export class SpendingType extends SchemaDto {
  @ApiProperty()
  @Prop()
  name: string;

  @ApiProperty()
  @Prop({ default: false })
  isSystem: boolean;

  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId })
  userId: ObjectId;

  @ApiProperty({ type: Date })
  @Prop()
  deleteAt: Date;
}

export const SpendingTypeSchema = SchemaFactory.createForClass(SpendingType);

SpendingTypeSchema.index({ isSystem: 1, userId: 1 });
SpendingTypeSchema.index({ userId: 1 });
