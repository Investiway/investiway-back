import { Module } from '@nestjs/common';
import {AuthService} from "./auth.service";
import {JwtModule} from "@nestjs/jwt";
import {JwtConfig} from "../configs/jwt.config";
import {SchemaModule} from "../schema/schema.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
    SchemaModule
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class ServicesModule {}
