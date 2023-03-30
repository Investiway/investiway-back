import { Module } from '@nestjs/common';
import {AuthService} from "./auth.service";
import {JwtModule} from "@nestjs/jwt";
import {JwtConfig} from "../configs/jwt.config";
import {SchemaModule} from "../schema/schema.module";
import {UserService} from "./user.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
    SchemaModule
  ],
  providers: [AuthService, UserService],
  exports: [AuthService, UserService],
})
export class ServicesModule {}
