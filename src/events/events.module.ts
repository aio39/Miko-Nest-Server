import { Module } from '@nestjs/common';
import { redisProviders } from 'redis.provider';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';

@Module({
  providers: [EventsGateway, EventsService, ...redisProviders],
  exports: [EventsGateway],
})
export class EventsModule {}
