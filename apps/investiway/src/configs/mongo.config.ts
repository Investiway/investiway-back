import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConfig implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMongooseOptions():
    | Promise<MongooseModuleOptions>
    | MongooseModuleOptions {
    const host = this.configService.get('IY_MONGO_HOST');
    const port = this.configService.get('IY_MONGO_PORT');
    const db = this.configService.get('IY_MONGO_DB');
    const uri = `mongodb://${host}:${port}/${db}`;
    return {
      uri,
    };
  }
}
