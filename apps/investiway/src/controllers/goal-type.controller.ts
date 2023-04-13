import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors} from "@nestjs/common";
import {ApiBearerAuth, ApiParam, ApiProperty, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {ResponseIntercept} from "../intercepts/response.intercept";
import {ApiPaginatedResponse} from "../decorators/api-paginated-reponse.decorator";
import {GoalType} from "../schema/goal-type.schema";
import {
  GoalTypeCreateOrEditBody, GoalTypeCreateOrEditParams,
  GoalTypeDeleteParams,
  GoalTypeGetOneParams,
  GoalTypeSearchQuery
} from "../dtos/goal-type.dto";
import {PageOptionsDto} from "../dtos/page.dto";
import {GoalTypeService} from "../services/goal-type.service";
import {ApiSuccessResponse} from "../decorators/response.decorator";
import {SchemaUpdateDto} from "../dtos/schema.dto";
import {CaslGuard, CheckCasl} from "../guards/casl.guard";
import {CaslAction} from "../casl/casl.enum";
import { plainToClass } from "class-transformer";

@UseGuards(AuthGuard('jwt-access'), CaslGuard)
@ApiBearerAuth()
@ApiTags('goal-type')
@UseInterceptors(ResponseIntercept)
@Controller({
  version: '1',
  path: 'goal-type',
})
export class GoalTypeController {
  constructor(
    private readonly goalTypeService: GoalTypeService
  ) {
  }
  
  @Get('search')
  @CheckCasl((ability, request) =>
    ability.can(
      CaslAction.Read,
      plainToClass(GoalType, { userId: request.query.userId }),
    ),
  )
  @ApiPaginatedResponse(GoalType)
  search(
    @Query() search: GoalTypeSearchQuery,
    @Query() page: PageOptionsDto
  ) {
    return this.goalTypeService.search(search, page);
  }
  
  @Get(':id')
  @UseInterceptors(ResponseIntercept)
  getOne(@Param() params: GoalTypeGetOneParams) {
    return this.goalTypeService.getById(params.id);
  }
  
  @Post()
  @CheckCasl((ability, request) =>
    ability.can(
      CaslAction.Read,
      plainToClass(GoalType, { userId: request.body.userId }),
    ),
  )
  @ApiSuccessResponse(GoalType)
  insert(
    @Body() data: GoalTypeCreateOrEditBody
  ) {
    return this.goalTypeService.insert(data);
  }
  
  @Put(':id')
  @CheckCasl((ability, request) =>
    ability.can(
      CaslAction.Read,
      plainToClass(GoalType, { userId: request.body.userId }),
    ),
  )
  @ApiSuccessResponse(SchemaUpdateDto)
  edit(
    @Param() params: GoalTypeCreateOrEditParams,
    @Body() data: GoalTypeCreateOrEditBody
  ) {
    return this.goalTypeService.update(params.id, data);
  }
  
  @Delete(':id')
  @ApiSuccessResponse(SchemaUpdateDto)
  delete(@Param() params: GoalTypeDeleteParams) {
    return this.goalTypeService.softDelete(params.id)
  }
}