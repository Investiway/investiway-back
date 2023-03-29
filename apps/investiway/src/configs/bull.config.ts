import { Injectable } from '@nestjs/common';
import {
  SharedBullConfigurationFactory,
  BullRootModuleOptions,
} from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullConfig implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  createSharedConfiguration():
    | Promise<BullRootModuleOptions>
    | BullRootModuleOptions {
    const host = this.configService.get('IY_REDIS_HOST');
    const port = this.configService.get('IY_REDIS_PORT');
    return {
      redis: {
        host,
        port,
      },
    };
  }
}
