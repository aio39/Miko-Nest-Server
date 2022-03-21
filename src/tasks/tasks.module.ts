import { Module } from '@nestjs/common';
import { OrmModule } from 'modules/orm/orm.module';
import { redisProviders } from 'redis.provider';
import { TasksService } from './tasks.service';

@Module({
  imports: [OrmModule],
  providers: [TasksService, ...redisProviders],
})
export class TasksModule {}
