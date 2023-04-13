import { Module } from '@nestjs/common';
import {AuthService} from "./auth.service";
import {JwtModule} from "@nestjs/jwt";
import {JwtConfig} from "../configs/jwt.config";
import {SchemaModule} from "../schema/schema.module";
import {UserService} from "./user.service";
import {GoalTypeService} from "./goal-type.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
    SchemaModule
  ],
  providers: [AuthService, UserService, GoalTypeService],
  exports: [AuthService, UserService, GoalTypeService],
})
export class ServicesModule {}
