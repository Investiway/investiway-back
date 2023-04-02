import { Module } from '@nestjs/common';
import {AppController} from "./app.controller";
import {AuthController} from "./auth.controller";
import {ServicesModule} from "../services/services.module";
import {GoalController} from "./goal.controller";
import {GoalTypeController} from "./goal-type.controller";

@Module({
  imports: [ServicesModule],
  controllers: [AppController, AuthController, GoalController, GoalTypeController]
})
export class ControllersModule {}
