import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../configs/jwt.config';
import { SchemaModule } from '../schema/schema.module';
import { UserService } from './user.service';
import { GoalTypeService } from './goal-type.service';
import { CaslAppFactory } from 'src/casl/casl.factory';
import { GoalService } from './goal.service';
import { NoteService } from './note.service';

const services = [
  AuthService,
  UserService,
  GoalTypeService,
  GoalService,
  NoteService,
];

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
    SchemaModule,
  ],
  providers: [CaslAppFactory, ...services],
  exports: services,
})
export class ServicesModule {}
