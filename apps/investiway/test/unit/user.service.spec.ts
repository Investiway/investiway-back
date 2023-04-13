import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { UserService } from '../../src/services/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { features } from '../../src/schema/schema.module';
import { FacebookAuthDto, GoogleAuthDto } from '../../src/dtos/auth.dto';
import { User, UserDocument } from '../../src/schema/user.schema';
import { Model } from 'mongoose';

describe('UserService', () => {
  let userService: UserService;
  let mongoServer: MongoMemoryServer;
  let module: TestingModule;
  let dFb: UserDocument, dGg: UserDocument;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature(features),
      ],
      providers: [UserService, ConfigService],
    }).compile();
    userService = module.get(UserService);

    // insert mock data
    const dataFb: FacebookAuthDto = {
      facebookId: 'fbId',
      email: 'fb@test.com',
      lastName: 'last',
      firstName: 'first',
    };
    const dataGg: GoogleAuthDto = {
      googleId: 'ggId',
      email: 'gg@test.com',
      lastName: 'last',
      firstName: 'first',
    };
    const modelUserRepo = module.get(
      getModelToken(User.name),
    ) as Model<UserDocument>;
    [dFb, dGg] = await modelUserRepo.insertMany([dataFb, dataGg]);
  });

  afterAll(async () => {
    await module.close();
    await mongoServer.stop();
  });

  it('UserService - findById', async () => {
    const sId = dFb._id.toString();
    const result = await userService.findById(sId);
    expect(result._id.toString()).toBe(sId);
  });

  it('UserService - findByFacebookId', async () => {
    const fbId = dFb.facebookId;
    const result = await userService.findByFacebookId(fbId);
    expect(result.facebookId).toBe(fbId);
  });

  it('UserService - findByGoogleId', async () => {
    const ggId = dGg.googleId;
    const result = await userService.findByGoogleId(ggId);
    expect(result.googleId).toBe(ggId);
  });
});
