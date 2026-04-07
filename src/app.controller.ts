import { Controller, Get, HttpCode, HttpStatus, Redirect } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  constructor() {}

  @Get()
  @ApiOperation({
    summary: 'Default welcome endpoint',
    description: 'Redirects to the health endpoint',
  })
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  @Redirect('health', 302)
  getHello() {
    return;
  }
}
