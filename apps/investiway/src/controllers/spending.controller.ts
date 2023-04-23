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
import { Spending } from 'src/schema/spending.schema';
import {
  SpendingCreateOrEditBody,
  SpendingCreateOrEditParams,
  SpendingDeleteParams,
  SpendingExtends,
  SpendingGetOneParams,
  SpendingSearchQuery,
} from 'src/dtos/spending.dto';
import { SpendingService } from 'src/services/spending.service';

@UseGuards(AuthGuard('jwt-access'), CaslGuard)
@ApiBearerAuth()
@ApiTags('spending')
@UseInterceptors(ResponseIntercept)
@Controller({
  version: '1',
  path: 'spending',
})
export class SpendingController {
  constructor(private readonly spendingService: SpendingService) {}

  @Get('search')
  @CheckCasl(
    new MatchFieldRequestCasl<SpendingSearchQuery, Spending>(
      CaslAction.Read,
      Spending,
      'query',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiPaginatedResponse(Spending, SpendingExtends)
  search(
    @Query() search: SpendingSearchQuery,
    @Query() page: PageOptionsDto,
    @GetUser() user: User,
  ) {
    return this.spendingService.search(search, page, user);
  }

  @Get(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Read, Spending))
  @UseInterceptors(ResponseIntercept)
  @ApiSuccessResponse(Spending, SpendingExtends)
  getOne(@Param() params: SpendingGetOneParams, @GetUser() user: User) {
    return this.spendingService.getById(params.id, user);
  }

  @Post()
  @CheckCasl(
    new MatchFieldRequestCasl<SpendingCreateOrEditBody, Spending>(
      CaslAction.Create,
      Spending,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(Spending, SpendingExtends)
  insert(@Body() data: SpendingCreateOrEditBody, @GetUser() user: User) {
    return this.spendingService.insert(data, user);
  }

  @Put(':id')
  @CheckCasl(
    new MatchFieldRequestCasl<SpendingCreateOrEditBody, Spending>(
      CaslAction.Update,
      Spending,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(SchemaUpdateDto)
  edit(
    @Param() params: SpendingCreateOrEditParams,
    @Body() data: SpendingCreateOrEditBody,
    @GetUser() user: User,
  ) {
    return this.spendingService.update(params.id, data, user);
  }

  @Delete(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Delete, Spending))
  @ApiSuccessResponse(SchemaUpdateDto)
  delete(@Param() params: SpendingDeleteParams, @GetUser() user: User) {
    return this.spendingService.softDelete(params.id, user);
  }
}
