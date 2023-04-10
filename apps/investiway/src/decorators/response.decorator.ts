import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import {ResponseSuccessDto} from "../dtos/response.dto";

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model: TModel
) => {
  return applyDecorators(
    ApiExtraModels(ResponseSuccessDto),
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseSuccessDto) },
          {
            properties: {
              result: {
                $ref: getSchemaPath(model)
              },
            },
          },
        ],
      },
    })
  );
};

