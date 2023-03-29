import {Controller, Get, Version} from "@nestjs/common";

@Controller('app')
export class AppController {
  @Version('1')
  @Get()
  get() {
    return 1;
  }
}