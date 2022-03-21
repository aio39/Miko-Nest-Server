import { Module } from '@nestjs/common';
import { OrmModule } from 'modules/orm/orm.module';
import { redisProviders } from 'redis.provider';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';

@Module({
  imports: [OrmModule],
  providers: [EventsGateway, EventsService, ...redisProviders],
  exports: [EventsGateway],
})
export class EventsModule {}
