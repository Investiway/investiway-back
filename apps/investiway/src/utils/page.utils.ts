import {Model, PipelineStage} from "mongoose";
import {PageOptionsDto} from "../dtos/page.dto";

export class PageUtils {
  
  static async countItems<T>(model: Model<T>, pipeline: PipelineStage[]): Promise<number> {
    const totalRow = await model.aggregate([
      ...pipeline,
      {
        $group: { _id: "", count: { $sum: 1 } }
      }
    ]).exec();
    const total = totalRow?.[0]?.['count'] || 0;
    return total
  }
  
  static pushLimitAndOrder(pipeline: PipelineStage[], page: PageOptionsDto) {
    if (page.skip) {
      pipeline.push({ $skip: page.skip });
    }
    if (page.page) {
      pipeline.push({ $limit: page.take });
    }
    if (page.order && page.orderField) {
      pipeline.push({
        $sort: {
          [page.orderField]: page.order
        }
      });
    }
  }
}