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
import { Note } from '../schema/note.schema';
import {
  NoteCreateOrEditBody,
  NoteCreateOrEditParams,
  NoteDeleteParams,
  NoteGetOneParams,
  NoteSearchQuery,
} from '../dtos/note.dto';
import { PageOptionsDto } from '../dtos/page.dto';
import { NoteService } from '../services/note.service';
import { ApiSuccessResponse } from '../decorators/response.decorator';
import { SchemaUpdateDto } from '../dtos/schema.dto';
import { CaslGuard, CheckCasl } from '../guards/casl.guard';
import { CaslAction } from '../casl/casl.enum';
import { MatchFieldRequestCasl } from 'src/casl/common/match-field-request.casl';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/schema/user.schema';

@UseGuards(AuthGuard('jwt-access'), CaslGuard)
@ApiBearerAuth()
@ApiTags('note')
@UseInterceptors(ResponseIntercept)
@Controller({
  version: '1',
  path: 'note',
})
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get('search')
  @CheckCasl(
    new MatchFieldRequestCasl<NoteSearchQuery, Note>(
      CaslAction.Read,
      Note,
      'query',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiPaginatedResponse(Note)
  search(@Query() search: NoteSearchQuery, @Query() page: PageOptionsDto) {
    return this.noteService.search(search, page);
  }

  @Get(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Read, Note))
  @UseInterceptors(ResponseIntercept)
  getOne(@Param() params: NoteGetOneParams, @GetUser() user: User) {
    return this.noteService.getById(params.id, user);
  }

  @Post()
  @CheckCasl(
    new MatchFieldRequestCasl<NoteCreateOrEditBody, Note>(
      CaslAction.Create,
      Note,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(Note)
  insert(@Body() data: NoteCreateOrEditBody) {
    return this.noteService.insert(data);
  }

  @Put(':id')
  @CheckCasl(
    new MatchFieldRequestCasl<NoteCreateOrEditBody, Note>(
      CaslAction.Update,
      Note,
      'body',
      [{ clazz: 'userId', request: 'userId' }],
    ),
  )
  @ApiSuccessResponse(SchemaUpdateDto)
  edit(
    @Param() params: NoteCreateOrEditParams,
    @Body() data: NoteCreateOrEditBody,
    @GetUser() user: User,
  ) {
    return this.noteService.update(params.id, data, user);
  }

  @Delete(':id')
  @CheckCasl((ability) => ability.can(CaslAction.Delete, Note))
  @ApiSuccessResponse(SchemaUpdateDto)
  delete(@Param() params: NoteDeleteParams, @GetUser() user: User) {
    return this.noteService.softDelete(params.id, user);
  }
}
