import { Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from '../configs/mongo.config';
import { User, UserSchema } from './user.schema';
import { GoalType, GoalTypeSchema } from './goal-type.schema';

export const features: ModelDefinition[] = [
  {
    name: User.name,
    schema: UserSchema,
  },
  {
    name: GoalType.name,
    schema: GoalTypeSchema,
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
