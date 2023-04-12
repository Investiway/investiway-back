import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { PageDto } from "src/dtos/page.dto";
import {ResponseSuccessDto} from "../dtos/response.dto";

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel
) => {
  return applyDecorators(
    ApiExtraModels(ResponseSuccessDto),
    ApiExtraModels(PageDto),
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseSuccessDto) },
          {
            properties: {
              result: {
                $ref: getSchemaPath(PageDto),
                properties: {
                  data: {
                    type: "array",
                    items: {$ref: getSchemaPath(model)},
                  },
                },
              },
            },
          },
        ],
      },
    })
  );
};
1