import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthController } from './auth.controller';
import { ServicesModule } from '../services/services.module';
import { GoalController } from './goal.controller';
import { GoalTypeController } from './goal-type.controller';
import { CaslAppFactory } from '../casl/casl.factory';
import { NoteController } from './note.controller';
import { SpendingTypeController } from './spending-type.controller';
import { SpendingController } from './spending.controller';

@Module({
  imports: [ServicesModule],
  controllers: [
    AppController,
    AuthController,
    GoalController,
    GoalTypeController,
    NoteController,
    SpendingTypeController,
    SpendingController,
  ],
  providers: [CaslAppFactory],
})
export class ControllersModule {}
