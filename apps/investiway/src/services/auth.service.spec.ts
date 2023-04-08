import {Test, TestingModule} from "@nestjs/testing";
import {AuthService} from "./auth.service";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongooseModule} from "@nestjs/mongoose";
import {UserService} from "./user.service";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import {features} from "../schema/schema.module";
import * as jwt from 'jsonwebtoken';
import {EAuthError} from "../constants/auth.constant";
import {FacebookAuthDto, GoogleAuthDto} from "../dtos/auth.dto";

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;
  let configService: ConfigService;
  let mongoServer: MongoMemoryServer;
  let module: TestingModule;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ 
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature(features),
      ],
      providers: [
        AuthService,
        UserService,
        JwtService,
        ConfigService
      ]
    }).compile();
    
    authService = module.get(AuthService);
    configService = module.get(ConfigService);
    userService = module.get(UserService);
  })

  afterAll(async () => {
    await module.close();
    await mongoServer.stop();
  })
  
  it('Sign access', async () => {
    const value = 'test-access';
    const result = await authService.signAccess(value);
    const secret = configService.get('IY_JWT_ACCESS_SECRET');
    const decode = jwt.verify(result, secret) as { id: string };
    return expect(value).toBe(decode.id);
  })

  it('Sign refresh', async () => {
    const value = 'test-refresh';
    const result = await authService.signRefresh(value);
    const secret = configService.get('IY_JWT_REFRESH_SECRET');
    const decode = jwt.verify(result, secret) as { id: string };
    return expect(value).toBe(decode.id);
  })

  it('FE redirect success created', async () => {
    const url = 'http://localhost:3434/auth?access_token=123&refresh_token=456';
    const result = authService.createFeUrlRedirect({ accessToken: '123', refreshToken: '456' });
    return expect(result).toBe(url);
  })

  it('FE redirect error created', async () => {
    const url = 'http://localhost:3434/auth?error_code=256';
    const result = authService.createFeUrlErrorRedirect(EAuthError.InternalServer);
    return expect(result).toBe(url);
  })
  
  it('Login with google', async () => {
    const data: FacebookAuthDto = {
      facebookId: '123',
      firstName: 'First',
      lastName: 'Last',
      email: 'test@test.com'
    }
    // noinspection DuplicatedCode
    const result = await authService.loginWithSocial(data);
    const secretAccess = configService.get('IY_JWT_ACCESS_SECRET');
    const secretRefresh = configService.get('IY_JWT_REFRESH_SECRET');
    const decodeRefresh = jwt.verify(result.refreshToken, secretRefresh) as { id: string };
    const decodeAccess = jwt.verify(result.accessToken, secretAccess) as { id: string };
    
    const accessId = decodeAccess.id;
    const refreshId = decodeRefresh.id;
    const dataId = await userService.findByFacebookId(data.facebookId);
    return expect([accessId, refreshId]).toEqual([dataId._id.toString(), dataId._id.toString()]);
  })

  it('Login with facebook', async () => {
    const data: GoogleAuthDto = {
      googleId: '789',
      firstName: 'First',
      lastName: 'Last',
      email: 'test@test.com'
    }
    // noinspection DuplicatedCode
    const result = await authService.loginWithSocial(data);
    const secretAccess = configService.get('IY_JWT_ACCESS_SECRET');
    const secretRefresh = configService.get('IY_JWT_REFRESH_SECRET');
    const decodeRefresh = jwt.verify(result.refreshToken, secretRefresh) as { id: string };
    const decodeAccess = jwt.verify(result.accessToken, secretAccess) as { id: string };

    const accessId = decodeAccess.id;
    const refreshId = decodeRefresh.id;
    const dataId = await userService.findByGoogleId(data.googleId);
    return expect([accessId, refreshId]).toEqual([dataId._id.toString(), dataId._id.toString()]);
  })
})