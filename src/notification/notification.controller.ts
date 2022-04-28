import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PushSubscription } from 'web-push';
import { Request, Response } from 'express';

@Controller('')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('/register')
    register(@Req() req:Request, @Res() res:Response) {
      return this.notificationService.register(req, res);
    }
    
    // @Post('/register')
    // register(@Req() req:Request, @Res() res:Response) {
    //   return this.notificationService.register(req, res);
    // }

    // @Get('/register')
    // register():string {
    //   return 'register';
    // }

    // @Get('/sendNotify')
    // sendNotify():string {
    //   return 'sendNotify';
    // }
}
