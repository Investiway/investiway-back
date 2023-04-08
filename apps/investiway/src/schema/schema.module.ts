import { Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from '../configs/mongo.config';
import { User, UserSchema } from './user.schema';

export const features: ModelDefinition[] = [
  {
    name: User.name,
    schema: UserSchema,
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
