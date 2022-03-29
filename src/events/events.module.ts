import { Module } from '@nestjs/common';
import { OrmModule } from 'modules/orm/orm.module';
import { redisProviders } from 'redis.provider';
import { ChatGateway } from './chat.gateway';
import { EnterGateway } from './enter.gateway';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { QuizGateway } from './quiz.gateway';
import { RankGateway } from './rank.gateway';
import { ScoreGateway } from './score.gateway';
import { StreamerGateway } from './streamer.gateway';

@Module({
  imports: [OrmModule],
  providers: [
    EventsGateway,
    RankGateway,
    ChatGateway,
    ScoreGateway,
    EnterGateway,
    StreamerGateway,
    QuizGateway,
    EventsService,
    ...redisProviders,
  ],
  exports: [EventsGateway],
})
export class EventsModule {}
