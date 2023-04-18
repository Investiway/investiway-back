import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { cors } from './configs/cors.config';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';
import * as expressBasicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Investiway')
    .setDescription('The Investiway API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('goal')
    .addTag('goal-type')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documents', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // this
    },
  });

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors({
    origin: cors,
  });

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/bull');
  createBullBoard({
    queues: [
      // new BullAdapter(app.get<Queue>('BullQueue_' + 'test')),
    ],
    serverAdapter,
  });
  app.use(
    '/bull',
    expressBasicAuth({
      users: {
        [configService.get('IY_BULL_USER')]: configService.get('IY_BULL_PWD'),
      },
      challenge: true,
    }),
    serverAdapter.getRouter(),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap().then(() => {});
