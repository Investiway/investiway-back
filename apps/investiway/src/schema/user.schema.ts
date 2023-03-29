import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  email: string;
  
  @Prop()
  googleId: string;
  
  @Prop()
  facebookId: string;
  
  @Prop()
  avatarUrl: string;
  
  @Prop()
  lastName: string;
  
  @Prop()
  firstName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);