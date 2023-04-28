import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { SchemaDto } from '../dtos/schema.dto';
import { ApiProperty } from '@nestjs/swagger';

export type SpendingStsDocument = HydratedDocument<SpendingSts>;

export enum ESpendingStsType {
  Day = 1,
  Month = 3,
  Year = 4,
}

@Schema({
  timestamps: true,
})
export class SpendingSts extends SchemaDto {
  @ApiProperty()
  @Prop()
  name: string;

  @ApiProperty()
  @Prop()
  amountAvg: number;

  @ApiProperty()
  @Prop()
  amountTotal: number;

  @ApiProperty()
  @Prop()
  count: number;

  @ApiProperty()
  @Prop()
  stsId: number;

  @ApiProperty({ enum: ESpendingStsType })
  @Prop({ type: Number })
  type: ESpendingStsType;

  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId })
  spendingTypeId: ObjectId;

  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId })
  userId: ObjectId;

  @ApiProperty({ type: Date })
  @Prop()
  deleteAt: Date;
}

export const SpendingStsSchema = SchemaFactory.createForClass(SpendingSts);
