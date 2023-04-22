import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ResponseIntercept } from '../intercepts/response.intercept';
import { ApiPaginatedResponse } from '../decorators/api-paginated-reponse.decorator';
import { GoalType } from '../schema/goal-type.schema';
import {
  GoalTypeCreateOrEditBody,
  GoalTypeCreateOrEditParams,
  GoalTypeDeleteParams,
  GoalTypeGetOneParams,
  GoalTypeSearchQuery,
} from '../dtos/goal-type.dto';
import { PageOptionsDto } from '../dtos/page.dto';
import { GoalTypeService } from '../services/goal-type.service';
import { ApiSuccessResponse } from '../decorators/response.decorator';
import { SchemaUpdateDto } from '../dtos/schema.dto';
import { CaslGuard, CheckCasl } from '../guards/casl.guard';
import { CaslAction } from '../casl/casl.enum';
import { MatchFieldRequestCasl } from 'src/casl/common/match-field-request.casl';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/schema/user.schema';

@UseGuards(AuthGuard('jwt-access'), CaslGuard)
@ApiBearerAuth()
@ApiTags('goal-type')
@UseInterceptors(ResponseIntercept)
@Controller({
  version: '1',
  path: 'goal-type',
})
export class GoalTypeController {
  constructor(private readonly goalTypeService: GoalTypeService) {}

  @Get('search')
  @CheckCasl(
    new MatchFieldRequestCasl<GoalTypeSearchQuery, GoalType>(
      CaslAction.Read,
      GoalType,
      'query',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiPaginatedResponse(GoalType)
  search(
    @Query() search: GoalTypeSearchQuery,
    @Query() page: PageOptionsDto,
    @GetUser() user: User,
  ) {
    return this.goalTypeService.search(search, page, user);
  }

  @Get(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Read, GoalType))
  @UseInterceptors(ResponseIntercept)
  @ApiSuccessResponse(GoalType)
  getOne(@Param() params: GoalTypeGetOneParams, @GetUser() user: User) {
    return this.goalTypeService.getById(params.id, user);
  }

  @Post()
  @CheckCasl(
    new MatchFieldRequestCasl<GoalTypeCreateOrEditBody, GoalType>(
      CaslAction.Create,
      GoalType,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(GoalType)
  insert(@Body() data: GoalTypeCreateOrEditBody) {
    return this.goalTypeService.insert(data);
  }

  @Put(':id')
  @CheckCasl(
    new MatchFieldRequestCasl<GoalTypeCreateOrEditBody, GoalType>(
      CaslAction.Update,
      GoalType,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(SchemaUpdateDto)
  edit(
    @Param() params: GoalTypeCreateOrEditParams,
    @Body() data: GoalTypeCreateOrEditBody,
    @GetUser() user: User,
  ) {
    return this.goalTypeService.update(params.id, data, user);
  }

  @Delete(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Delete, GoalType))
  @ApiSuccessResponse(SchemaUpdateDto)
  delete(@Param() params: GoalTypeDeleteParams, @GetUser() user: User) {
    return this.goalTypeService.softDelete(params.id, user);
  }
}
