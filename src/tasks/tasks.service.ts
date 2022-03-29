import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { RANK_RETURN_NUM } from 'const';
import { ConcertAddedScorePerTimes } from 'entities/ConcertAddedScorePerTimes';
import { EventsGateway } from 'events/events.gateway';
import {
  rkConTicketAddedScoreForM,
  rkConTicketScoreRanking,
} from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';

@Injectable()
export class TasksService {
  private server;

  constructor(
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
    @InjectRepository(ConcertAddedScorePerTimes)
    private readonly concertAddedScorePerTime: EntityRepository<ConcertAddedScorePerTimes>,
    private readonly eventGateway: EventsGateway,
  ) {
    this.server = this.eventGateway.server;
  }

  private readonly logger = new Logger(TasksService.name);

  // TODO  1분 동안의 도네이션
  // TODO 1분 동안의 슈퍼챗
  // TODO 1분 동안의 텍스트량
  // TODO 시간별 접속 유저수
  // TODO 최고 동시 접속자 수

  // N(1)분 동안 추가된 콘서트 스코어 점수를 가져와서 DB에 넣고 0으로 초기화
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

  // TODO 콘서트 정리 작업
  // 종료된

  @Interval(5000)
  async handleBroadcastRank() {
    const keys = await this.redisClient.keys('ScoreRanking-*');
    keys.map((key) => {
      const ticketId = key.split('-')[1];
      this.redisClient
        .zRangeWithScores(
          rkConTicketScoreRanking(+ticketId),
          0,
          RANK_RETURN_NUM,
          { REV: true },
        )
        .then((rank) => {
          this.eventGateway.server.to(ticketId).emit('be-broadcast-rank', rank);
        });
    });
  }
}
