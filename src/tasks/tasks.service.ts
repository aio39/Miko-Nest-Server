import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { RANK_RETURN_NUM } from 'const';
import { ConcertAddedScorePerTimes } from 'entities/ConcertAddedScorePerTimes';
import { CoTiAddedChatPerTimes } from 'entities/CoTiAddedChatPerTimes';
import { CoTiAmountDonePerTimes } from 'entities/CoTiAmountDonePerTimes';
import { CoTiAmountSuperChatPerTimes } from 'entities/CoTiAmountSuperChatPerTimes';
import { CoTiCurEnterUserNums } from 'entities/CoTiCurEnterUserNums';
import { EventsGateway } from 'events/events.gateway';
import {
  rkConTicketAddedChatForM,
  rkConTicketAddedScoreForM,
  rkConTicketAmountDoneForM,
  rkConTicketAmountSuChatForM,
  rkConTicketEnterUserNum,
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
    @InjectRepository(CoTiAddedChatPerTimes)
    private readonly coTiAddedChatPerTimes: EntityRepository<CoTiAddedChatPerTimes>,
    @InjectRepository(CoTiAmountDonePerTimes)
    private readonly coTiAmountDonePerTimes: EntityRepository<CoTiAmountDonePerTimes>,
    @InjectRepository(CoTiAmountSuperChatPerTimes)
    private readonly coTiAmountSuperChatPerTimes: EntityRepository<CoTiAmountSuperChatPerTimes>,
    @InjectRepository(CoTiCurEnterUserNums)
    private readonly coTiCurEnterUserNums: EntityRepository<CoTiCurEnterUserNums>,
    private readonly eventGateway: EventsGateway,
  ) {
    this.server = this.eventGateway.server;
  }

  private readonly logger = new Logger(TasksService.name);

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

  // TODO  1분 동안의 도네이션
  @Cron('* * * * *') // 매 0분 0초 마다
  async updateCoTiAmountDonePerTimes() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketAmountDoneForM(),
    );
    this.redisClient.DEL(rkConTicketAmountDoneForM());

    const dataList: CoTiAmountDonePerTimes[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const data = new CoTiAmountDonePerTimes();
      data.amount = parseInt(amount);
      const [concertId, ticketId] = key.split('/');
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
      dataList.push(data);
    }

    this.coTiAmountDonePerTimes.persistAndFlush(dataList);
  }

  // TODO 1분 동안의 슈퍼챗
  @Cron('* * * * *') // 매 0분 0초 마다
  async updateCoTiAmountSuperChatForM() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketAmountSuChatForM(),
    );
    this.redisClient.DEL(rkConTicketAmountSuChatForM());

    const dataList: CoTiAmountSuperChatPerTimes[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const data = new CoTiAmountSuperChatPerTimes();
      data.amount = parseInt(amount);
      const [concertId, ticketId] = key.split('/');
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
      dataList.push(data);
    }

    this.coTiAmountSuperChatPerTimes.persistAndFlush(dataList);
  }

  // TODO 1분 동안의 텍스트량
  @Cron('* * * * *') // 매 0분 0초 마다
  async updateConTicketAddedChatForM() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketAddedChatForM(),
    );
    this.redisClient.DEL(rkConTicketAddedChatForM());

    const dataList: CoTiAddedChatPerTimes[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const data = new CoTiAddedChatPerTimes();
      data.added = parseInt(amount);
      const [concertId, ticketId] = key.split('/');
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
      dataList.push(data);
    }

    this.coTiAddedChatPerTimes.persistAndFlush(dataList);
  }

  // TODO 시간별 접속 유저수
  @Cron('* * * * *') // 매 0분 0초 마다
  async updateCoTiCurEnterUserNums() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketEnterUserNum(),
    );
    // 시간별 접속 유저는 초기화 하면 안됨.
    // this.redisClient.DEL(rkConTicketEnterUserNum());

    const dataList: CoTiCurEnterUserNums[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const data = new CoTiCurEnterUserNums();
      data.nums = parseInt(amount);
      const [concertId, ticketId] = key.split('/');
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
      dataList.push(data);
    }

    this.coTiCurEnterUserNums.persistAndFlush(dataList);
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
