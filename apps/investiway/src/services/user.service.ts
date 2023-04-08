import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import {FacebookAuthDto, GoogleAuthDto, TokenGroup} from "../dtos/auth.dto";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../schema/user.schema";
import {FilterQuery, Model, ObjectId} from "mongoose";
import {EAuthError} from "../constants/auth.constant";
import { Types } from "mongoose";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
  }

  findById(id: string) {
    return this.userModel.findOne({
      _id: new Types.ObjectId(id)
    });
  }
  
  findByFacebookId(facebookId: string) {
    return this.userModel.findOne({
      facebookId
    })
  }

  findByGoogleId(googleId: string) {
    return this.userModel.findOne({
      googleId
    })
  }
}