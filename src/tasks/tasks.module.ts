import { Module } from '@nestjs/common';
import { EventsModule } from 'events/events.module';
import { OrmModule } from 'modules/orm/orm.module';
import { redisProviders } from 'redis.provider';
import { TasksService } from './tasks.service';

@Module({
  imports: [OrmModule, EventsModule],
  providers: [TasksService, ...redisProviders],
})
export class TasksModule {}
