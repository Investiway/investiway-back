import { PipelineStage } from 'mongoose';

export class SchemaUtils {
  static getMatchIsNotDelete(additionalField: any = {}) {
    return {
      $match: this.getIsNotDelete(additionalField),
    };
  }

  static getIsNotDelete(additionalField: any = {}) {
    return {
      deleteAt: { $eq: null },
      ...additionalField,
    };
  }

  static pushLookup2Root<SchemaRoot, SchemaLookup, ModelExtends>(
    pipeline: PipelineStage[],
    clazz: { new (): SchemaLookup },
    coorditional: {
      localField: keyof SchemaRoot;
      foreignKey: keyof SchemaLookup;
    },
    keyMap: Partial<{ [key in keyof ModelExtends]: keyof SchemaLookup }>,
  ) {
    const lkField = `_${clazz.name}`;
    pipeline.push({
      $lookup: {
        from: clazz.name,
        localField: coorditional.localField as string,
        foreignField: coorditional.foreignKey as string,
        as: lkField,
      },
    });
    pipeline.push({
      $unwind: {
        path: `$${lkField}`,
        preserveNullAndEmptyArrays: true,
      },
    });
    pipeline.push({
      $set: Object.keys(keyMap).reduce((val, key) => {
        val[key] = `$${keyMap[key]}`;
        return val;
      }, {}),
    });
    pipeline.push({
      $unset: lkField,
    });
  }

  static getCreatedAt(data: any) {
    return data.createdAt || new Date();
  }
}
