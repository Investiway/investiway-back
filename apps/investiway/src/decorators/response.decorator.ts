import { applyDecorators, Type } from "@nestjs/common";
import {ApiExtraModels, ApiOkResponse, ApiResponseOptions, getSchemaPath} from "@nestjs/swagger";
import {ResponseErrorDto, ResponseSuccessDto} from "../dtos/response.dto";

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

export const ApiErrorResponse = <TModel extends Type<any>>(
  decorator: (options?: ApiResponseOptions) => (MethodDecorator & ClassDecorator)
) => {
  return applyDecorators(
    ApiExtraModels(ResponseErrorDto),
    decorator({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseErrorDto) },
        ],
      },
    })
  );
};

