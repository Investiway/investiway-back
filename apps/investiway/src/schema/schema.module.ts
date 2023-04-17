import { Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from '../configs/mongo.config';
import { User, UserSchema } from './user.schema';
import { GoalType, GoalTypeSchema } from './goal-type.schema';
import { Goal, GoalSchema } from './goal.schema';

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
