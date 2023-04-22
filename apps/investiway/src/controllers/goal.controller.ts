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
import { PageOptionsDto } from '../dtos/page.dto';
import { ApiSuccessResponse } from '../decorators/response.decorator';
import { SchemaUpdateDto } from '../dtos/schema.dto';
import { CaslGuard, CheckCasl } from '../guards/casl.guard';
import { CaslAction } from '../casl/casl.enum';
import { MatchFieldRequestCasl } from 'src/casl/common/match-field-request.casl';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/schema/user.schema';
import { Goal } from 'src/schema/goal.schema';
import {
  GoalCreateOrEditBody,
  GoalCreateOrEditParams,
  GoalDeleteParams,
  GoalExtends,
  GoalGetOneParams,
  GoalSearchQuery,
} from 'src/dtos/goal.dto';
import { GoalService } from 'src/services/goal.service';

@UseGuards(AuthGuard('jwt-access'), CaslGuard)
@ApiBearerAuth()
@ApiTags('goal')
@UseInterceptors(ResponseIntercept)
@Controller({
  version: '1',
  path: 'goal',
})
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get('search')
  @CheckCasl(
    new MatchFieldRequestCasl<GoalSearchQuery, Goal>(
      CaslAction.Read,
      Goal,
      'query',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiPaginatedResponse(Goal, GoalExtends)
  search(
    @Query() search: GoalSearchQuery,
    @Query() page: PageOptionsDto,
    @GetUser() user: User,
  ) {
    return this.goalService.search(search, page, user);
  }

  @Get(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Read, Goal))
  @UseInterceptors(ResponseIntercept)
  @ApiSuccessResponse(Goal, GoalExtends)
  getOne(@Param() params: GoalGetOneParams, @GetUser() user: User) {
    return this.goalService.getById(params.id, user);
  }

  @Post()
  @CheckCasl(
    new MatchFieldRequestCasl<GoalCreateOrEditBody, Goal>(
      CaslAction.Create,
      Goal,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(Goal, GoalExtends)
  insert(@Body() data: GoalCreateOrEditBody, @GetUser() user: User) {
    return this.goalService.insert(data, user);
  }

  @Put(':id')
  @CheckCasl(
    new MatchFieldRequestCasl<GoalCreateOrEditBody, Goal>(
      CaslAction.Update,
      Goal,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(SchemaUpdateDto)
  edit(
    @Param() params: GoalCreateOrEditParams,
    @Body() data: GoalCreateOrEditBody,
    @GetUser() user: User,
  ) {
    return this.goalService.update(params.id, data, user);
  }

  @Delete(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Delete, Goal))
  @ApiSuccessResponse(SchemaUpdateDto)
  delete(@Param() params: GoalDeleteParams, @GetUser() user: User) {
    return this.goalService.softDelete(params.id, user);
  }
}
