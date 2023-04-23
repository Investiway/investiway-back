import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { SchemaDto } from 'src/dtos/schema.dto';

export type GoalDocument = HydratedDocument<Goal>;

@Schema({
  timestamps: true,
})
export class Goal extends SchemaDto {
  @ApiProperty()
  @Prop()
  name: string;

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty()
  @Prop({ type: Types.Decimal128 })
  amountTarget: number;

  @ApiProperty()
  @Prop({ type: Types.Decimal128 })
  amountMinimumPerMonth: number;

  @ApiProperty()
  @Prop()
  completeDate: Date;

  @ApiProperty()
  @Prop()
  priority: number;

  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId })
  goalTypeId: ObjectId;

  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId })
  userId: ObjectId;

  @ApiProperty({ type: Date })
  @Prop()
  deleteAt: Date;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
