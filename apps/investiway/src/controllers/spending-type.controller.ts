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
import { SpendingType } from '../schema/spending-type.schema';
import {
  SpendingTypeCreateOrEditBody,
  SpendingTypeCreateOrEditParams,
  SpendingTypeDeleteParams,
  SpendingTypeGetOneParams,
  SpendingTypeSearchQuery,
} from '../dtos/spending-type.dto';
import { PageOptionsDto } from '../dtos/page.dto';
import { SpendingTypeService } from '../services/spending-type.service';
import { ApiSuccessResponse } from '../decorators/response.decorator';
import { SchemaUpdateDto } from '../dtos/schema.dto';
import { CaslGuard, CheckCasl } from '../guards/casl.guard';
import { CaslAction } from '../casl/casl.enum';
import { MatchFieldRequestCasl } from 'src/casl/common/match-field-request.casl';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/schema/user.schema';

@UseGuards(AuthGuard('jwt-access'), CaslGuard)
@ApiBearerAuth()
@ApiTags('spending-type')
@UseInterceptors(ResponseIntercept)
@Controller({
  version: '1',
  path: 'spending-type',
})
export class SpendingTypeController {
  constructor(private readonly spendingTypeService: SpendingTypeService) {}

  @Get('search')
  @CheckCasl(
    new MatchFieldRequestCasl<SpendingTypeSearchQuery, SpendingType>(
      CaslAction.Read,
      SpendingType,
      'query',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiPaginatedResponse(SpendingType)
  search(
    @Query() search: SpendingTypeSearchQuery,
    @Query() page: PageOptionsDto,
    @GetUser() user: User,
  ) {
    return this.spendingTypeService.search(search, page, user);
  }

  @Get(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Read, SpendingType))
  @UseInterceptors(ResponseIntercept)
  getOne(@Param() params: SpendingTypeGetOneParams, @GetUser() user: User) {
    return this.spendingTypeService.getById(params.id, user);
  }

  @Post()
  @CheckCasl(
    new MatchFieldRequestCasl<SpendingTypeCreateOrEditBody, SpendingType>(
      CaslAction.Create,
      SpendingType,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(SpendingType)
  insert(@Body() data: SpendingTypeCreateOrEditBody) {
    return this.spendingTypeService.insert(data);
  }

  @Put(':id')
  @CheckCasl(
    new MatchFieldRequestCasl<SpendingTypeCreateOrEditBody, SpendingType>(
      CaslAction.Update,
      SpendingType,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(SchemaUpdateDto)
  edit(
    @Param() params: SpendingTypeCreateOrEditParams,
    @Body() data: SpendingTypeCreateOrEditBody,
    @GetUser() user: User,
  ) {
    return this.spendingTypeService.update(params.id, data, user);
  }

  @Delete(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Delete, SpendingType))
  @ApiSuccessResponse(SchemaUpdateDto)
  delete(@Param() params: SpendingTypeDeleteParams, @GetUser() user: User) {
    return this.spendingTypeService.softDelete(params.id, user);
  }
}
