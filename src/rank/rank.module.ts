import { Module } from '@nestjs/common';
import { EventsModule } from 'events/events.module';
import { redisProviders } from 'redis.provider';
import { RankController } from './rank.controller';
import { RankService } from './rank.service';

@Module(
  {
    imports: [EventsModule],
    controllers: [RankController],
    providers: [RankService, ...redisProviders],
  })
export class RankModule { }
