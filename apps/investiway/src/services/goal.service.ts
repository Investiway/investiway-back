import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model, PipelineStage } from 'mongoose';
import { Types } from 'mongoose';
import { Goal, GoalDocument } from '../schema/goal.schema';
import { GoalCreateOrEditBody, GoalSearchQuery } from '../dtos/goal.dto';
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
import { GoalTypeService } from './goal-type.service';
import * as moment from 'moment';

@Injectable()
export class GoalService {
  constructor(
    @InjectModel(Goal.name) private goalModel: Model<GoalDocument>,
    private readonly caslAppFactory: CaslAppFactory,
    private readonly goalTypeService: GoalTypeService,
  ) {}

  async search(
    search: GoalSearchQuery,
    page: PageOptionsDto,
    authorizator: User,
  ) {
    // casl can't inside scope, because controller checked
    const pipeline: PipelineStage[] = [];
    const caslObject: Partial<Goal> = {};
    if (search.userId) {
      const userId = new Types.ObjectId(search.userId);
      pipeline.push({
        $match: { userId },
      });
      caslObject.userId = userId as any;
    }
    if (search.goalTypeId) {
      await this.goalTypeService.checkAuthorization(
        search.goalTypeId,
        authorizator,
        CaslAction.Read,
      );
      const goalTypeId = new Types.ObjectId(search.goalTypeId);
      pipeline.push({
        $match: { goalTypeId },
      });
      caslObject.goalTypeId = goalTypeId as any;
    }

    const casl = this.caslAppFactory.createForUser(authorizator);
    if (
      casl.cannot(
        CaslAction.Read,
        caslObject2String(Goal, convert<Goal>(caslObject), 'userId'),
      )
    ) {
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
    const total = await PageUtils.countItems(this.goalModel, pipeline);

    PageUtils.pushLimitAndOrder(pipeline, page);
    const data = await this.goalModel.aggregate(pipeline).exec();
    const pageMetaParamsDto = new PageMetaDtoParameters(page, total);
    const pageMetaDto = new PageMetaDto(pageMetaParamsDto);
    const result = new PageDto(data, pageMetaDto);
    return result;
  }

  getById(id: string, authorizator: User): Promise<Goal> {
    return this.checkAuthorization(id, authorizator, CaslAction.Read);
  }

  async checkAuthorization(
    id: string,
    authorizator: User,
    caslAction: CaslAction,
  ) {
    const r = await this.goalModel.findOne(
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
      caslObject2String(Goal, convert<Goal>(r.toJSON()), 'userId'),
    );
    if (authroization) {
      throw new ForbiddenException();
    }
    return r;
  }

  async softDelete(id: string, authorizator: User) {
    // casl authorizator
    await this.checkAuthorization(id, authorizator, CaslAction.Delete);
    return await this.goalModel.updateOne(
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

  async insert(data: GoalCreateOrEditBody, authorizator: User) {
    // casl can't inside scope, because controller checked
    await this.goalTypeService.checkAuthorization(
      data.goalTypeId,
      authorizator,
      CaslAction.Read,
    );

    const amountMinimumPerMonth = this.computeAmountPerMonth(data);
    return this.goalModel
      .insertMany([
        {
          ...convertToObjectId(data, 'userId', 'goalTypeId'),
          amountMinimumPerMonth,
        },
      ])
      .then((r) => r?.[0]);
  }

  async update(id: string, data: GoalCreateOrEditBody, authorizator: User) {
    // casl authorizator, data can't check authroization 'userid' because check inside controller
    await this.checkAuthorization(id, authorizator, CaslAction.Update);
    await this.goalTypeService.checkAuthorization(
      data.goalTypeId,
      authorizator,
      CaslAction.Read,
    );

    const amountMinimumPerMonth = this.computeAmountPerMonth(data);
    return await this.goalModel.updateOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id),
      }),
      {
        $set: {
          ...convertToObjectId(data, 'userId', 'goalTypeId'),
          amountMinimumPerMonth,
        },
      },
    );
  }

  private computeAmountPerMonth(data: GoalCreateOrEditBody): number {
    const target = moment(data.completeDate);
    const month = target.diff(moment(), 'month');
    return Math.round(data.amountTarget / Math.max(1, month));
  }
}
