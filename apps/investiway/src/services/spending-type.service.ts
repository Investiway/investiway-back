import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model, PipelineStage } from 'mongoose';
import { Types } from 'mongoose';
import {
  SpendingType,
  SpendingTypeDocument,
} from '../schema/spending-type.schema';
import {
  ESpendingTypeIsSystem,
  SpendingTypeCreateOrEditBody,
  SpendingTypeSearchQuery,
} from '../dtos/spending-type.dto';
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
import { plainToClass } from 'class-transformer';

@Injectable()
export class SpendingTypeService {
  constructor(
    @InjectModel(SpendingType.name)
    private spendingTypeModel: Model<SpendingTypeDocument>,
    private readonly caslAppFactory: CaslAppFactory,
  ) {}

  async search(
    search: SpendingTypeSearchQuery,
    page: PageOptionsDto,
    authorizator: User,
  ) {
    // casl can't inside scope, because controller checked
    let $lastedMatch: { [key: string]: any } = {};
    const pipeline: PipelineStage[] = [{ $match: $lastedMatch }];
    const caslObject: Partial<SpendingType> = {};
    if (search.userId) {
      const userId = new Types.ObjectId(search.userId);
      if (!search.isSystem) {
        $lastedMatch.userId = userId;
      } else {
        $lastedMatch = $lastedMatch.$and = {
          userId: userId,
        };
      }
      caslObject.userId = userId as any;
    } else {
      $lastedMatch = {};
      pipeline.push({ $match: $lastedMatch });
    }

    if (search.isSystem) {
      $lastedMatch.isSystem = search.isSystem === ESpendingTypeIsSystem.True;
      caslObject.isSystem = $lastedMatch.isSystem;
    }

    const casl = this.caslAppFactory.createForUser(authorizator);
    if (casl.cannot(CaslAction.Read, plainToClass(SpendingType, caslObject))) {
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
    const total = await PageUtils.countItems(this.spendingTypeModel, pipeline);

    PageUtils.pushLimitAndOrder(pipeline, page);
    const data = await this.spendingTypeModel.aggregate(pipeline).exec();
    const pageMetaParamsDto = new PageMetaDtoParameters(page, total);
    const pageMetaDto = new PageMetaDto(pageMetaParamsDto);
    const result = new PageDto(data, pageMetaDto);
    return result;
  }

  getById(id: string, authorizator: User): Promise<SpendingType> {
    return this.checkAuthorization(id, authorizator, CaslAction.Read);
  }

  async checkAuthorization(
    id: string,
    authorizator: User,
    caslAction: CaslAction,
  ) {
    const r = await this.spendingTypeModel.findOne(
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
      caslObject2String(
        SpendingType,
        convert<SpendingType>(r.toJSON()),
        'userId',
      ),
    );
    if (authroization) {
      throw new ForbiddenException();
    }
    return r;
  }

  async softDelete(id: string, authorizator: User) {
    // casl authorizator
    await this.checkAuthorization(id, authorizator, CaslAction.Delete);
    return await this.spendingTypeModel.updateOne(
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

  insert(data: SpendingTypeCreateOrEditBody) {
    // casl can't inside scope, because controller checked
    return this.spendingTypeModel
      .insertMany([convertToObjectId(data, 'userId')])
      .then((r) => r?.[0]);
  }

  async update(
    id: string,
    data: SpendingTypeCreateOrEditBody,
    authorizator: User,
  ) {
    // casl authorizator, data can't check authroization 'userid' because check inside controller
    await this.checkAuthorization(id, authorizator, CaslAction.Update);
    return await this.spendingTypeModel.updateOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id),
      }),
      {
        $set: convertToObjectId(data, 'userId'),
      },
    );
  }
}
