import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model, PipelineStage } from 'mongoose';
import { Types } from 'mongoose';
import { GoalType, GoalTypeDocument } from '../schema/goal-type.schema';
import {
  GoalTypeCreateOrEditBody,
  GoalTypeSearchQuery,
} from '../dtos/goal-type.dto';
import {
  PageDto,
  PageMetaDto,
  PageMetaDtoParameters,
  PageOptionsDto,
} from '../dtos/page.dto';
import { PageUtils } from '../utils/page.utils';
import { SchemaUtils } from '../utils/schema.utils';
import {
  caslObject2String,
  convert,
  convertToObjectId,
} from 'src/utils/common.util';
import { CaslAppFactory } from 'src/casl/casl.factory';
import { CaslAction } from 'src/casl/casl.enum';

@Injectable()
export class GoalTypeService {
  constructor(
    @InjectModel(GoalType.name) private goalTypeModel: Model<GoalTypeDocument>,
    private readonly caslAppFactory: CaslAppFactory,
  ) {}

  async search(
    search: GoalTypeSearchQuery,
    page: PageOptionsDto,
    authorizator: User,
  ) {
    // casl can't inside scope, because controller checked
    const pipeline: PipelineStage[] = [];
    const caslObject: Partial<GoalType> = {};
    if (search.userId) {
      const userId = new Types.ObjectId(search.userId);
      pipeline.push({
        $match: { userId },
      });
      caslObject.userId = userId as any;
    }

    const casl = this.caslAppFactory.createForUser(authorizator);
    const canSearch = casl.cannot(
      CaslAction.Read,
      caslObject2String(GoalType, convert<GoalType>(caslObject), 'userId'),
    );
    if (canSearch) {
      throw new ForbiddenException();
    }

    if (search.search) {
      pipeline.push({
        $match: {
          name: new RegExp(`${search.search}`, 'i'),
        },
      });
    }
    pipeline.push(SchemaUtils.getMatchIsNotDelete());
    const total = await PageUtils.countItems(this.goalTypeModel, pipeline);

    PageUtils.pushLimitAndOrder(pipeline, page);
    const data = await this.goalTypeModel.aggregate(pipeline).exec();
    const pageMetaParamsDto = new PageMetaDtoParameters(page, total);
    const pageMetaDto = new PageMetaDto(pageMetaParamsDto);
    const result = new PageDto(data, pageMetaDto);
    return result;
  }

  getById(id: string, authorizator: User): Promise<GoalType> {
    return this.checkAuthorization(id, authorizator, CaslAction.Read);
  }

  async checkAuthorization(
    id: string,
    authorizator: User,
    caslAction: CaslAction,
  ) {
    const r = await this.goalTypeModel.findOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id),
      }),
    );
    if (!r) {
      throw new NotFoundException();
    }
    const casl = this.caslAppFactory.createForUser(authorizator);
    const authroization = casl.cannot(
      caslAction,
      caslObject2String(GoalType, convert<GoalType>(r.toJSON()), 'userId'),
    );
    if (authroization) {
      throw new ForbiddenException();
    }
    return r;
  }

  async softDelete(id: string, authorizator: User) {
    // casl authorizator
    await this.checkAuthorization(id, authorizator, CaslAction.Delete);
    return await this.goalTypeModel.updateOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id),
      }),
      {
        $set: {
          deleteAt: new Date(),
        },
      },
    );
  }

  insert(data: GoalTypeCreateOrEditBody) {
    // casl can't inside scope, because controller checked
    return this.goalTypeModel
      .insertMany([convertToObjectId(data, 'userId')])
      .then((r) => r?.[0]);
  }

  async update(id: string, data: GoalTypeCreateOrEditBody, authorizator: User) {
    // casl authorizator, data can't check authroization 'userid' because check inside controller
    await this.checkAuthorization(id, authorizator, CaslAction.Update);
    return await this.goalTypeModel.updateOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id),
      }),
      {
        $set: convertToObjectId(data, 'userId'),
      },
    );
  }
}
