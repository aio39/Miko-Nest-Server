import { Module } from '@nestjs/common';
import { EventsModule } from 'events/events.module';
import { redisProviders } from 'redis.provider';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [EventsModule],
  controllers:[NotificationController],
  providers: [NotificationService, ...redisProviders]
})
export class NotificationModule {}
