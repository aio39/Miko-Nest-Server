import { Controller, Post, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';

@Controller('')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('/register')
    register(@Req() req:Request) {
     return this.notificationService.register(req);
    }
}
