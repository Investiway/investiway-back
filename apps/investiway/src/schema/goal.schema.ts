import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GoalDocument = HydratedDocument<Goal>;

@Schema({
  timestamps: true,
})
export class Goal {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.Decimal128 })
  amountTarget: number;

  @Prop({ type: Types.Decimal128 })
  amountMinimumPerMonth: number;

  @Prop()
  completeDate: Date;

  @Prop()
  priority: number;

  @Prop()
  type: number;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
