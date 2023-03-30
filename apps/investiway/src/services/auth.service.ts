import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import {FacebookAuthDto, GoogleAuthDto, TokenGroup} from "../dtos/auth.dto";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../schema/user.schema";
import {FilterQuery, Model} from "mongoose";

@Injectable()
export class AuthService {
  get ggClientID() {
    return this.configService.get('IY_GOOGLE_CLIENT_ID');
  }
  
  get ggClientSecret() {
    return this.configService.get('IY_GOOGLE_CLIENT_SECRET');
  }
  
  get ggRedirectURI() {
    return this.configService.get('IY_GOOGLE_REDIRECT_URI');
  }
  
  get fbAppID() {
    return this.configService.get('IY_FACEBOOK_APP_ID');
  }
  
  get fbAppSecret() {
    return this.configService.get('IY_FACEBOOK_APP_SECRET');
  }
  
  get fbRedirectUri() {
    return this.configService.get('IY_FACEBOOK_REDIRECT_URI');
  }
  
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  
  async loginWithFacebook(data: FacebookAuthDto | GoogleAuthDto): Promise<TokenGroup> {
    const filter: FilterQuery<Partial<UserDocument>> = {};
    if ((<GoogleAuthDto>data).googleId) {
      filter.googleId = (<GoogleAuthDto>data).googleId
    }
    if ((<FacebookAuthDto>data).facebookId) {
      filter.facebookId = (<FacebookAuthDto>data).facebookId;
    }
    let user = await this.userModel.findOne(filter);
    if (!user) {
      [user] = await this.userModel.insertMany([data]);
    } else {
      await this.userModel.updateMany(
        filter,
        [{ $set: data }],
        { upsert: true }
      );
    }
      
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccess(user._id.toString()),
      this.signRefresh(user._id.toString()),
    ])
    return {
      accessToken,
      refreshToken,
    };
  }

  createFeUrlRedirect(token: TokenGroup) {
    const redirect =
      this.configService.get('IY_FRONTEND_REDIRECT_LOGIN');
    return redirect.replace('_1_', token.accessToken).replace('_2_', token.refreshToken);
  }
  
  signAccess(id: any) {
    return this.jwtService.signAsync({ id }, {
      secret: this.configService.get('IY_JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('IY_JWT_ACCESS_EXPIRED'),
    });
  }

  verifyAccess(data: any) {
    return this.jwtService.verifyAsync(data, {
      secret: this.configService.get('IY_JWT_ACCESS_SECRET'),
    });
  }

  signRefresh(id: any) {
    return this.jwtService.signAsync({ id }, {
      secret: this.configService.get('IY_JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('IY_JWT_REFRESH_EXPIRED'),
    });
  }

  verifyRefresh(data: any) {
    return this.jwtService.verifyAsync(data, {
      secret: this.configService.get('IY_JWT_REFRESH_SECRET'),
    });
  }
}