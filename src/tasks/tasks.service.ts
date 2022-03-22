import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConcertAddedScorePerTimes } from 'entities/ConcertAddedScorePerTimes';
import { rkConTicketAddedScoreForM } from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';

@Injectable()
export class TasksService {
  constructor(
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
    @InjectRepository(ConcertAddedScorePerTimes)
    private readonly concertAddedScorePerTime: EntityRepository<ConcertAddedScorePerTimes>,
  ) {}

  private readonly logger = new Logger(TasksService.name);

  @Cron('* * * * *') // 매 0분 0초 마다
  async updateConcertAddedScoreForM() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketAddedScoreForM(),
    );
    this.redisClient.DEL(rkConTicketAddedScoreForM());

    const dataList: ConcertAddedScorePerTimes[] = [];

    for (const [key, score] of Object.entries(hashResult)) {
      const data = new ConcertAddedScorePerTimes();
      data.addedScore = parseInt(score);
      const [concertId, ticketId] = key.split('/');
      console.log('concert score', concertId, ticketId);
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
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
