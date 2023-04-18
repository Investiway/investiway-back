import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { INestApplicationContext, Injectable } from '@nestjs/common';

@Injectable()
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private configService: ConfigService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.configService = app.get(ConfigService);
  }

  getUri() {
    const uri = this.configService.get('IY_REDIS_URI');
    if (uri) {
      return uri;
    }
    const host = this.configService.get('IY_REDIS_HOST');
    const port = this.configService.get('IY_REDIS_PORT');
    return `redis://${host}:${port}`;
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: this.getUri() });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
