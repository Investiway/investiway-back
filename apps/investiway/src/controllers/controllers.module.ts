import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthController } from './auth.controller';
import { ServicesModule } from '../services/services.module';
import { GoalController } from './goal.controller';
import { GoalTypeController } from './goal-type.controller';
import { CaslAppFactory } from '../casl/casl.factory';

@Module({
  imports: [ServicesModule],
  controllers: [
    AppController,
    AuthController,
    GoalController,
    GoalTypeController,
  ],
  providers: [CaslAppFactory],
})
export class ControllersModule {}
