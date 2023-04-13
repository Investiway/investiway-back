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
}
