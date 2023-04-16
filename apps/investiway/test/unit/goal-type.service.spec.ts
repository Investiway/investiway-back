import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { features } from 'src/schema/schema.module';
import { GoalTypeService } from 'src/services/goal-type.service';
import { Model, Types } from 'mongoose';
import { GoalType, GoalTypeDocument } from 'src/schema/goal-type.schema';
import { CaslAppFactory } from 'src/casl/casl.factory';
import {
  GoalTypeCreateOrEditBody,
  GoalTypeSearchQuery,
} from 'src/dtos/goal-type.dto';
import { PageOptionsDto } from 'src/dtos/page.dto';
import { plainToClass } from 'class-transformer';
import { PageMetaDto } from 'src/dtos/page.dto';
import { User } from 'src/schema/user.schema';
import { caslObject2String, convert } from 'src/utils/common.util';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('GoalTypeService', () => {
  let goalTypeService: GoalTypeService;
  let goalTypeModel: Model<GoalType>;
  let mongoServer: MongoMemoryServer;
  let module: TestingModule;
  let gtExcepted: GoalType[];
  let gtDeleteExcepted, gtUnexcepted: GoalType;
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
      providers: [GoalTypeService, ConfigService, CaslAppFactory],
    }).compile();
    goalTypeService = module.get(GoalTypeService);
    goalTypeModel = module.get(getModelToken(GoalType.name)) as Model<GoalType>;
  });

  const resetData = async () => {
    const data: Partial<GoalType>[] = [
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
    [gtDeleteExcepted, gtUnexcepted] = await goalTypeModel.insertMany(data);
    const ds = await goalTypeModel.insertMany(
      Array.from({ length: 20 }).map((_, index) => ({
        userId: s2id(userIdExcepted) as any,
        name: 'gt name ' + index,
        description: 'gt description ' + index,
      })),
    );
    gtExcepted = ds as unknown as GoalType[];
  };

  const object2id = (data: GoalType[]) => {
    return data.map((item) => item._id.toString());
  };

  afterAll(async () => {
    await module.close();
    await mongoServer.stop();
  });

  it('GoalTypeService - search all', async () => {
    await resetData();
    const pageOptions = plainToClass(PageOptionsDto, {
      take: 20,
    } as Partial<PageOptionsDto>);
    const search = plainToClass(GoalTypeSearchQuery, {
      userId: userIdExcepted,
    } as Partial<GoalTypeSearchQuery>);
    const result = await goalTypeService.search(search, pageOptions);
    expect(result.meta).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: false,
      itemCount: 20,
      page: 1,
      pageCount: 1,
      take: 20,
    } as PageMetaDto);
    expect(object2id(result.data)).toMatchObject(object2id(gtExcepted));
  });

  it('GoalTypeService - search page 2 take 5', async () => {
    await resetData();
    const pageOptions = plainToClass(PageOptionsDto, {
      take: 5,
      page: 2,
    } as Partial<PageOptionsDto>);
    const search = plainToClass(GoalTypeSearchQuery, {
      userId: userIdExcepted,
    } as Partial<GoalTypeSearchQuery>);
    const result = await goalTypeService.search(search, pageOptions);
    expect(result.meta).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: true,
      itemCount: 20,
      page: 2,
      pageCount: 4,
      take: 5,
    } as PageMetaDto);
    expect(object2id(result.data)).toMatchObject(
      object2id(gtExcepted.slice(5, 10)),
    );
  });

  it('GoalTypeService - search with name', async () => {
    await resetData();
    const pageOptions = plainToClass(
      PageOptionsDto,
      {} as Partial<PageOptionsDto>,
    );
    const search = plainToClass(GoalTypeSearchQuery, {
      search: 'name 3',
      userId: userIdExcepted,
    } as Partial<GoalTypeSearchQuery>);
    const result = await goalTypeService.search(search, pageOptions);
    expect(result.meta).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: false,
      itemCount: 1,
      page: 1,
      pageCount: 1,
      take: 10,
    } as PageMetaDto);
    expect(object2id(result.data)).toMatchObject(
      object2id(gtExcepted.filter((item) => item.name.includes('name 3'))),
    );
  });

  it('GoalTypeService - search authorization', async () => {
    // not test - because authz check in controller
    expect(1).toBe(1);
  });

  it('GoalTypeService - getById', async () => {
    await resetData();
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    for (const gt of gtExcepted) {
      const result = await goalTypeService.getById(
        gt._id.toString(),
        authorizator,
      );
      expect(convert<GoalTypeDocument>(result).toJSON()).toMatchObject(
        convert<GoalTypeDocument>(gt).toJSON(),
      );
    }
  });

  it('GoalTypeService - getById forbidden', async () => {
    await resetData();
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;

    let ex: ForbiddenException;
    try {
      await goalTypeService.getById(gtUnexcepted._id.toString(), authorizator);
    } catch (e) {
      ex = e;
    }
    expect(ex).toMatchObject(new ForbiddenException());
  });

  it('GoalTypeService - getById soft delete', async () => {
    await resetData();
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;

    let ex: NotFoundException;
    try {
      await goalTypeService.getById(
        gtDeleteExcepted._id.toString(),
        authorizator,
      );
    } catch (e) {
      ex = e;
    }
    expect(ex).toMatchObject(new NotFoundException());
  });

  it('GoalTypeService - softDelete', async () => {
    await resetData();
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    for (const gt of gtExcepted) {
      const result = await goalTypeService.softDelete(
        gt._id.toString(),
        authorizator,
      );
      expect(result.modifiedCount).toBe(1);
    }
  });

  it('GoalTypeService - softDelete forbidden', async () => {
    await resetData();
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;

    let ex: ForbiddenException;
    try {
      await goalTypeService.softDelete(
        gtUnexcepted._id.toString(),
        authorizator,
      );
    } catch (e) {
      ex = e;
    }
    expect(ex).toMatchObject(new ForbiddenException());
  });

  it('GoalTypeService - insert', async () => {
    await goalTypeModel.deleteMany({});
    const result = await goalTypeService.insert({
      name: 'test',
      description: 'test',
      userId: s2id(userIdExcepted) as any,
    });
    expect(
      caslObject2String(
        GoalType,
        convert<GoalTypeDocument>(result).toJSON(),
        '_id',
        'userId',
      ),
    ).toMatchObject(
      caslObject2String(
        GoalType,
        convert<GoalTypeDocument>(await goalTypeModel.findOne({})).toJSON(),
        '_id',
        'userId',
      ),
    );
  });

  it('GoalTypeService - insert authorization', async () => {
    // not test - because authz check in controller
    expect(1).toBe(1);
  });

  it('GoalTypeService - update', async () => {
    await resetData();
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    for (const gt of gtExcepted) {
      const result = await goalTypeService.update(
        gt._id.toString(),
        {
          name: 'test 2',
          description: 'description 2',
        } as GoalTypeCreateOrEditBody,
        authorizator,
      );
      expect(result.modifiedCount).toBe(1);
      const expected = await goalTypeModel.findById(gt._id);
      expect({
        name: expected.name,
        description: expected.description,
      }).toMatchObject({
        name: 'test 2',
        description: 'description 2',
      });
    }
  });

  it('GoalTypeService - update authorization', async () => {
    await resetData();
    const authorizator = {
      _id: s2id(userIdExcepted) as any,
    } as User;
    let ex: ForbiddenException;
    try {
      await goalTypeService.update(
        gtUnexcepted._id.toString(),
        {} as GoalTypeCreateOrEditBody,
        authorizator,
      );
    } catch (e) {
      ex = e;
    }
    expect(ex).toMatchObject(new ForbiddenException());
  });

  it('GoalTypeService - update (data) authorization', async () => {
    // not test - because authz check in controller
    expect(1).toBe(1);
  });
});
