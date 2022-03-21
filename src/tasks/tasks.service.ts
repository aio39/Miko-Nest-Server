import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConcertAddedScorePerTime } from 'entities/ConcertAddedScorePerTime';
import { rkConcertAddedScoreForM } from 'helper/createRedisKey/createRedisKey';
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
  async handleCron() {
    const hashResult = await this.redisClient.HGETALL(
      rkConcertAddedScoreForM(),
    );
    this.redisClient.DEL(rkConcertAddedScoreForM());

    const dataList: ConcertAddedScorePerTime[] = [];

    for (const [key, score] of Object.entries(hashResult)) {
      const data = new ConcertAddedScorePerTime();
      data.addedScore = parseInt(score);
      const [concertId, ticketId] = key.split('/');
      data.concertId = concertId;
      data.ticketId = ticketId;
      dataList.push(data);
    }

    this.concertAddedScorePerTime.persistAndFlush(dataList);
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
