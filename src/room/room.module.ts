import { Module } from '@nestjs/common';
import { EventsModule } from 'events/events.module';
import { OrmModule } from 'modules/orm/orm.module';
import { redisProviders } from 'redis.provider';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [OrmModule, EventsModule],
  controllers: [RoomController],
  providers: [RoomService, ...redisProviders],
})
export class RoomModule {}
