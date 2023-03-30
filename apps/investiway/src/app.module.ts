import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import { ServicesModule } from './services/services.module';
import { ControllersModule } from './controllers/controllers.module';
import {JwtModule} from "@nestjs/jwt";
import {FacebookStrategy} from "./strategy/facebook.strategy";
import {GoogleStrategy} from "./strategy/google.strategy";
import {JwtAccessStrategy} from "./strategy/jwt-access.strategy";
import {JwtRefreshStrategy} from "./strategy/jwt-refresh.strategy";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ServicesModule,
    ControllersModule,
  ],
  controllers: [],
  providers: [
    FacebookStrategy,
    GoogleStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AppModule {}
