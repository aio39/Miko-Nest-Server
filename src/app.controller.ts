import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(): string {
    return this.appService.root();
  }

  @Get('/redis')
  redisTest(@Req() req: Request): any {
    const key: string | undefined = req.cookies.laravel_session;
    if (key) return this.appService.redisTest(key);
    return false;
  }

  @Get('/health-check')
  healthCheck(): string {
    return 'ok';
  }
}
