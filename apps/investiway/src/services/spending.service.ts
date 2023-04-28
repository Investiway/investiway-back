import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import mongoose, { FilterQuery, Model, PipelineStage } from 'mongoose';
import { Types } from 'mongoose';
import { Spending, SpendingDocument } from '../schema/spending.schema';
import {
  SpendingCreateOrEditBody,
  SpendingExtends,
  SpendingSearchQuery,
} from '../dtos/spending.dto';
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
import { SpendingTypeService } from './spending-type.service';
import * as moment from 'moment';
import { SpendingType } from 'src/schema/spending-type.schema';
import { SpendingStsService } from './spending-sts.service';

@Injectable()
export class SpendingService {
  private readonly logger = new Logger('SpendingService');

  constructor(
    @InjectModel(Spending.name) private spendingModel: Model<SpendingDocument>,
    @InjectConnection() private readonly mongoConnection: mongoose.Connection,
    private readonly caslAppFactory: CaslAppFactory,
    private readonly goalTypeService: SpendingTypeService,
    private readonly spendingStsService: SpendingStsService,
  ) {}

  async search(
    search: SpendingSearchQuery,
    page: PageOptionsDto,
    authorizator: User,
  ) {
    // casl can't inside scope, because controller checked
    const pipeline: PipelineStage[] = [];
    const caslObject: Partial<Spending> = {};
    if (search.userId) {
      const userId = new Types.ObjectId(search.userId);
      pipeline.push({
        $match: { userId },
      });
      caslObject.userId = userId as any;
    }
    if (search.spendingTypeId) {
      await this.goalTypeService.checkAuthorization(
        search.spendingTypeId,
        authorizator,
        CaslAction.Read,
      );
      const spendingTypeId = new Types.ObjectId(search.spendingTypeId);
      pipeline.push({
        $match: { spendingTypeId },
      });
      caslObject.spendingTypeId = spendingTypeId as any;
    }

    let filterDate: FilterQuery<any> = { $and: [] };
    if (search.startDate) {
      filterDate.$and.push({
        createdAt: {
          $gte: moment(search.startDate).toDate(),
        },
      });
    }
    if (search.endDate) {
      const f = {
        createdAt: {
          $lte: moment(search.endDate).toDate(),
        },
      };
      if (filterDate.$and.length) {
        filterDate.$and.push(f);
      } else {
        filterDate = f;
      }
    }
    if (search.startDate || search.endDate) {
      pipeline.push({
        $match: filterDate,
      });
    }

    const casl = this.caslAppFactory.createForUser(authorizator);
    if (
      casl.cannot(
        CaslAction.Read,
        caslObject2String(
          Spending,
          convert<Spending>(caslObject),
          'userId',
          'spendingTypeId',
        ),
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
    const total = await PageUtils.countItems(this.spendingModel, pipeline);

    PageUtils.pushLimitAndOrder(pipeline, page);
    this.pushDep2Root(pipeline);
    const data = await this.spendingModel.aggregate(pipeline).exec();
    const pageMetaParamsDto = new PageMetaDtoParameters(page, total);
    const pageMetaDto = new PageMetaDto(pageMetaParamsDto);
    const result = new PageDto(data, pageMetaDto);
    return result;
  }

  getById(id: string, authorizator: User): Promise<Spending> {
    return this.checkAuthorization(id, authorizator, CaslAction.Read, true);
  }

  async checkAuthorization(
    id: string,
    authorizator: User,
    caslAction: CaslAction,
    isDep = false,
  ) {
    const pipeline: PipelineStage[] = [
      {
        $match: SchemaUtils.getIsNotDelete({
          _id: new Types.ObjectId(id),
        }),
      },
    ];
    if (isDep) {
      this.pushDep2Root(pipeline);
    }
    const aggResult = await this.spendingModel.aggregate(pipeline).exec();
    const r = aggResult?.[0];
    if (!r) {
      throw new NotFoundException();
    }
    const casl = this.caslAppFactory.createForUser(authorizator);
    const authroization = casl.cannot(
      caslAction,
      caslObject2String(
        Spending,
        convert<Spending>(r),
        'userId',
        'spendingTypeId',
      ),
    );
    if (authroization) {
      throw new ForbiddenException();
    }
    return r;
  }

  async softDelete(id: string, authorizator: User) {
    // casl authorizator
    const spending = await this.checkAuthorization(
      id,
      authorizator,
      CaslAction.Delete,
    );
    const result = await this.spendingModel.updateOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id),
      }),
      {
        $set: {
          deleteAt: new Date(),
        },
      },
    );
    await this.spendingStsService.deleteRowSpending(spending);
    return result;
  }

  async insert(data: SpendingCreateOrEditBody, authorizator: User) {
    await this.goalTypeService.checkAuthorization(
      data.spendingTypeId,
      authorizator,
      CaslAction.Create,
    );

    const goal = await this.spendingModel
      .insertMany([convertToObjectId(data, 'userId', 'spendingTypeId')])
      .then((r) => r?.[0]);

    const result = await this.getById(goal._id, authorizator);
    await this.spendingStsService.pushRowSpending(result);
    return result;
  }

  async update(id: string, data: SpendingCreateOrEditBody, authorizator: User) {
    const spendingOld = await this.checkAuthorization(
      id,
      authorizator,
      CaslAction.Update,
    );
    await this.goalTypeService.checkAuthorization(
      data.spendingTypeId,
      authorizator,
      CaslAction.Read,
    );

    const result = await this.spendingModel.updateOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id),
      }),
      {
        $set: convertToObjectId(data, 'userId', 'spendingTypeId'),
      },
    );

    const spendingNew = { ...spendingOld, ...(data as any) };
    await this.spendingStsService.updateRowSpending(spendingOld, spendingNew);
    return result;
  }

  private pushDep2Root(pipeline: PipelineStage[]) {
    SchemaUtils.pushLookup2Root<Spending, SpendingType, SpendingExtends>(
      pipeline,
      SpendingType,
      {
        localField: 'spendingTypeId',
        foreignKey: '_id',
      },
      {
        spendingTypeName: 'name',
      },
    );
  }
}
