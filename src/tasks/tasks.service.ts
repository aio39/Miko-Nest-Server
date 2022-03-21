import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConcertAddedScorePerTime } from 'entities/ConcertAddedScorePerTime';
import { RedisClientType } from 'redis';

@Injectable()
export class TasksService {
  constructor(
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
    @InjectRepository(ConcertAddedScorePerTime)
    private readonly concertAddedScorePerTime: EntityRepository<ConcertAddedScorePerTime>,
  ) {}

  private readonly logger = new Logger(TasksService.name);

  @Cron('* * * * *') // 매 0분 0초 마다
  handleCron() {
    this.logger.debug('Called when the second is 45');
  }

  // @Interval(10000)
  // handleInterval() {
  //   this.logger.debug('Called every 10 seconds');
  // }

  // @Timeout(5000)
  // handleTimeout() {
  //   this.logger.debug('Called once after 5 seconds');
  // }
}
