import { UserDocument } from '../schema/user.schema';

declare namespace Express {
  export interface Request {
    user: UserDocument;
  }
}
