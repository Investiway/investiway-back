import { Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from '../configs/mongo.config';
import { User, UserSchema } from './user.schema';
import { GoalType, GoalTypeSchema } from './goal-type.schema';
import { Goal, GoalSchema } from './goal.schema';
import { Note, NoteSchema } from './note.schema';
import { SpendingType, SpendingTypeSchema } from './spending-type.schema';
import { Spending, SpendingSchema } from './spending.schema';
import { SpendingSts, SpendingStsSchema } from './spending-sts.schema';

export const features: ModelDefinition[] = [
  {
    name: User.name,
    schema: UserSchema,
  },
  {
    name: GoalType.name,
    schema: GoalTypeSchema,
  },
  {
    name: Goal.name,
    schema: GoalSchema,
  },
  {
    name: Note.name,
    schema: NoteSchema,
  },
  {
    name: SpendingType.name,
    schema: SpendingTypeSchema,
  },
  {
    name: Spending.name,
    schema: SpendingSchema,
  },
  {
    name: SpendingSts.name,
    schema: SpendingStsSchema,
  },
];

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfig,
    }),
    MongooseModule.forFeature(features),
  ],
  exports: [MongooseModule.forFeature(features)],
})
export class SchemaModule {}
