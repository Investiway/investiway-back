import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PageDto } from 'src/dtos/page.dto';
import { ResponseSuccessDto } from '../dtos/response.dto';

export const ApiPaginatedResponse = (...model: Type<any>[]) => {
  return applyDecorators(
    ApiExtraModels(ResponseSuccessDto),
    ApiExtraModels(PageDto),
    ApiExtraModels(...model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseSuccessDto) },
          {
            properties: {
              result: {
                allOf: [
                  { $ref: getSchemaPath(PageDto) },
                  {
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          allOf: model.map((m) => ({
                            $ref: getSchemaPath(m),
                          })),
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
};
