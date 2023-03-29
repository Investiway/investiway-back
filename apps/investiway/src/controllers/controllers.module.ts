import { Module } from '@nestjs/common';
import {AppController} from "./app.controller";
import {AuthController} from "./auth.controller";
import {ServicesModule} from "../services/services.module";

@Module({
  imports: [ServicesModule],
  controllers: [AppController, AuthController]
})
export class ControllersModule {}
