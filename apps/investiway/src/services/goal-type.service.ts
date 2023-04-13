import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../schema/user.schema";
import {Model, PipelineStage} from "mongoose";
import { Types } from "mongoose";
import {GoalType, GoalTypeDocument, GoalTypeSchema} from "../schema/goal-type.schema";
import {GoalTypeCreateOrEditBody, GoalTypeSearchQuery} from "../dtos/goal-type.dto";
import {PageDto, PageMetaDto, PageMetaDtoParameters, PageOptionsDto} from "../dtos/page.dto";
import {PageUtils} from "../utils/page.utils";
import {SchemaUtils} from "../utils/schema.utils";

@Injectable()
export class GoalTypeService {
  constructor(
    @InjectModel(GoalType.name) private goalTypeModel: Model<GoalTypeDocument>,
  ) {
  }

  async search(search: GoalTypeSearchQuery, page: PageOptionsDto) {
    const pipeline: PipelineStage[] = []
    if (search.userId) {
      pipeline.push({
        $match: { userId: new Types.ObjectId(search.userId) }
      })
    }
    if (search.search) {
      pipeline.push({
        $match: {
          name: new RegExp(`${search.search}`, 'i')
        }
      })
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
  
  getById(id: string) {
    return this.goalTypeModel.aggregate([
      SchemaUtils.getMatchIsNotDelete({
        _id: new Types.ObjectId(id)
      })
    ]).exec();
  }
  
  softDelete(id: string) {
    return this.goalTypeModel.updateOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id)
      }),
      {
        $set: {
          deleteAt: new Date(),
        }
      }
    )
  }
  
  insert(data: GoalTypeCreateOrEditBody) {
    return this.goalTypeModel.insertMany([
      data
    ])
  }
  
  update(id: string, data: GoalTypeCreateOrEditBody) {
    return this.goalTypeModel.updateOne(
      SchemaUtils.getIsNotDelete({
        _id: new Types.ObjectId(id)
      }),
      {
        $set: {
          ...data
        }
      }
    )
  }
}