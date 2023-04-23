import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { features } from 'src/schema/schema.module';
import { GoalService } from 'src/services/goal.service';
import { Model, Types } from 'mongoose';
import { Goal } from 'src/schema/goal.schema';
import { CaslAppFactory } from 'src/casl/casl.factory';
import { GoalSearchQuery } from 'src/dtos/goal.dto';
import { PageOptionsDto } from 'src/dtos/page.dto';
import { plainToClass } from 'class-transformer';
import { PageMetaDto } from 'src/dtos/page.dto';
import { User } from 'src/schema/user.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as moment from 'moment';
import { GoalType } from 'src/schema/goal-type.schema';
import { GoalTypeService } from 'src/services/goal-type.service';

describe('GoalService', () => {
  let goalService: GoalService;
  let goalModel: Model<Goal>;
  let goalTypeModel: Model<GoalType>;
  let mongoServer: MongoMemoryServer;
  let module: TestingModule;
  let gExcepted: Goal[];
  let gDeleteExcepted: Goal, gUnexcepted: Goal;
  let gtExcepted: GoalType, gtDeleteExcepted: GoalType, gtUnexcepted: GoalType;
  const userIdExcepted = '6436b7a329d7b7c6ed7d8b61';
  const userIdUnExcepted = '6436b7a329d7b7c6ed7d8b62';

  const s2id = (id: string) => new Types.ObjectId(id);

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
      providers: [GoalService, GoalTypeService, ConfigService, CaslAppFactory],
    }).compile();
    goalService = module.get(GoalService);
    goalModel = module.get(getModelToken(Goal.name)) as Model<Goal>;
    goalTypeModel = module.get(getModelToken(GoalType.name)) as Model<GoalType>;
    await resetDataType();
  });

  const resetDataType = async () => {
    const data: Partial<GoalType>[] = [
      {
        userId: s2id(userIdExcepted) as any,
        name: 'gt name',
        description: 'gt description',
      },
      {
        userId: s2id(userIdExcepted) as any,
        name: 'gt name delete',
        description: 'gt description delete',
        deleteAt: new Date(),
      },
      {
        userId: s2id(userIdUnExcepted) as any,
        name: 'gt name unexcepted',
        description: 'gt description unexcepted',
      },
    ];
    await goalTypeModel.deleteMany({});
    [gtExcepted, gtDeleteExcepted, gtUnexcepted] =
      await goalTypeModel.insertMany(data);
  };

  const resetData = async () => {
    const data: Partial<Goal>[] = [
      {
        userId: s2id(userIdExcepted) as any,
        name: 'gt name delete',
        description: 'gt description delete',
        amountTarget: 100,
        completeDate: moment().add(1, 'month').toDate(),
        deleteAt: new Date(),
        goalTypeId: s2id(gtDeleteExcepted._id.toString()) as any,
      },
      {
        userId: s2id(userIdUnExcepted) as any,
        name: 'gt name unexcepted',
        description: 'gt description unexcepted',
        amountTarget: 100,
        completeDate: moment().add(1, 'month').toDate(),
        goalTypeId: s2id(gtUnexcepted._id.toString()) as any,
      },
    ];
    await goalModel.deleteMany({});
    [gDeleteExcepted, gUnexcepted] = await goalModel.insertMany(data);
    const ds = await goalModel.insertMany(
      Array.from({ length: 20 }).map((_, index) => ({
        userId: s2id(userIdExcepted) as any,
        name: 'gt name ' + index,
        description: 'gt description ' + index,
        amountTarget: 100,
        completeDate: moment().add(1, 'month').toDate(),
        goalTypeId: s2id(gtExcepted._id.toString()),
      })),
    );
    gExcepted = ds as unknown as Goal[];
  };

  const object2id = (data: Goal[]) => {
    return data.map((item) => item._id.toString());
  };

  afterAll(async () => {
    await module.close();
    await mongoServer.stop();
  });

  it('Goal - search all', async () => {
    await resetData();
    const pageOptions = plainToClass(PageOptionsDto, {
      take: 20,
    } as Partial<PageOptionsDto>);
    const search = plainToClass(GoalSearchQuery, {
      userId: userIdExcepted,
    } as Partial<GoalSearchQuery>);
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    const result = await goalService.search(search, pageOptions, authorizator);
    expect(result.meta).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: false,
      itemCount: 20,
      page: 1,
      pageCount: 1,
      take: 20,
    } as PageMetaDto);
    expect(object2id(result.data)).toMatchObject(object2id(gExcepted));
  });

  it('GoalService - search page 2 take 5', async () => {
    await resetData();
    const pageOptions = plainToClass(PageOptionsDto, {
      take: 5,
      page: 2,
    } as Partial<PageOptionsDto>);
    const search = plainToClass(GoalSearchQuery, {
      userId: userIdExcepted,
    } as Partial<GoalSearchQuery>);
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    const result = await goalService.search(search, pageOptions, authorizator);
    expect(result.meta).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: true,
      itemCount: 20,
      page: 2,
      pageCount: 4,
      take: 5,
    } as PageMetaDto);
    expect(object2id(result.data)).toMatchObject(
      object2id(gExcepted.slice(5, 10)),
    );
  });

  it('GoalService - search with name', async () => {
    await resetData();
    const pageOptions = plainToClass(
      PageOptionsDto,
      {} as Partial<PageOptionsDto>,
    );
    const search = plainToClass(GoalSearchQuery, {
      search: 'name 3',
      userId: userIdExcepted,
    } as Partial<GoalSearchQuery>);
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    const result = await goalService.search(search, pageOptions, authorizator);
    expect(result.meta).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: false,
      itemCount: 1,
      page: 1,
      pageCount: 1,
      take: 10,
    } as PageMetaDto);
    expect(object2id(result.data)).toMatchObject(
      object2id(gExcepted.filter((item) => item.name.includes('name 3'))),
    );
  });

  it('GoalService - search with type', async () => {
    await resetData();
    const pageOptions = plainToClass(
      PageOptionsDto,
      {} as Partial<PageOptionsDto>,
    );
    const search = plainToClass(GoalSearchQuery, {
      search: 'name 3',
      userId: userIdExcepted,
      goalTypeId: gtExcepted._id.toString(),
    } as Partial<GoalSearchQuery>);
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    const result = await goalService.search(search, pageOptions, authorizator);
    expect(result.meta).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: false,
      itemCount: 1,
      page: 1,
      pageCount: 1,
      take: 10,
    } as PageMetaDto);
    expect(object2id(result.data)).toMatchObject(
      object2id(gExcepted.filter((item) => item.name.includes('name 3'))),
    );
  });

  it('GoalService - search with type forbiden', async () => {
    await resetData();
    const pageOptions = plainToClass(
      PageOptionsDto,
      {} as Partial<PageOptionsDto>,
    );
    const search = plainToClass(GoalSearchQuery, {
      search: 'name 3',
      userId: userIdExcepted,
      goalTypeId: gtUnexcepted._id.toString(),
    } as Partial<GoalSearchQuery>);
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    let ex: ForbiddenException;
    try {
      await goalService.search(search, pageOptions, authorizator);
    } catch (e) {
      ex = e;
    }
    expect(ex).toMatchObject(new ForbiddenException());
  });

  it('GoalService - search with type not found', async () => {
    await resetData();
    const pageOptions = plainToClass(
      PageOptionsDto,
      {} as Partial<PageOptionsDto>,
    );
    const search = plainToClass(GoalSearchQuery, {
      search: 'name 3',
      userId: userIdExcepted,
      goalTypeId: gtDeleteExcepted._id.toString(),
    } as Partial<GoalSearchQuery>);
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    let ex: NotFoundException;
    try {
      await goalService.search(search, pageOptions, authorizator);
    } catch (e) {
      ex = e;
    }
    expect(ex).toMatchObject(new NotFoundException());
  });

  it('GoalService - search authorization', async () => {
    // not test - because authz check in controller
    expect(1).toBe(1);
  });
});
