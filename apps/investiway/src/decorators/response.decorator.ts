import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseErrorDto, ResponseSuccessDto } from '../dtos/response.dto';

export const ApiSuccessResponse = (...model: Type<any>[]) => {
  return applyDecorators(
    ApiExtraModels(ResponseSuccessDto),
    ApiExtraModels(...model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseSuccessDto) },
          {
            properties: {
              result: {
                allOf: model.map((m) => ({
                  $ref: getSchemaPath(m),
                })),
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiErrorResponse = (
  decorator: (options?: ApiResponseOptions) => MethodDecorator & ClassDecorator,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseErrorDto),
    decorator({
      schema: {
        allOf: [{ $ref: getSchemaPath(ResponseErrorDto) }],
      },
    }),
  );
};
