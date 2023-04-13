import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ResponseIntercept } from '../intercepts/response.intercept';

@UseGuards(AuthGuard('jwt-access'))
@ApiBearerAuth()
@ApiTags('goal')
@Controller('goal')
export class GoalController {
  @Get('search')
  search() {}

  @Get(':id')
  @UseInterceptors(ResponseIntercept)
  getOne() {
    return 1;
  }

  @Post()
  insert() {}

  @Put(':id')
  edit() {}

  @Delete(':id')
  delete() {}
}
