import { Module } from '@nestjs/common';
import { EventsModule } from 'events/events.module';
import { redisProviders } from 'redis.provider';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';

@Module({
  imports: [EventsModule],
  controllers: [ConcertsController],
  providers: [ConcertsService, ...redisProviders],
})
export class ConcertsModule {}
