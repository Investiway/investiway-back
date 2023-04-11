import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";
import {SchemaDto} from "../dtos/schema.dto";

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User extends SchemaDto {
  @ApiProperty()
  @Prop()
  email: string;

  @ApiProperty()
  @Prop()
  googleId: string;
  
  @ApiProperty()
  @Prop()
  facebookId: string;

  @ApiProperty()
  @Prop()
  avatarUrl: string;

  @ApiProperty()
  @Prop()
  lastName: string;

  @ApiProperty()
  @Prop()
  firstName: string;
  
  @ApiProperty()
  @Prop()
  shouldResetPassword: boolean;

  @ApiProperty()
  @Prop()
  shouldAddEmail: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);