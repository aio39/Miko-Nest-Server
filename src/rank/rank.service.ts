import { Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from 'events/events.gateway';
import { rkConTicketPublicRoom } from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';

@Injectable()
export class RankService {
  constructor(
    private readonly eventGateway: EventsGateway,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) {}

  async getRank(ticketId: number) {
    //  결과 페이지
    const rank = await this.redisClient.zRangeWithScores(
      rkConTicketPublicRoom(ticketId),
      0,
      -1,
      { REV: true },
    );
    return rank;
  }

  async getMyRank(concertId: number, roomId: string) {
    // 자기랭크 반환
    const myRank = await this.redisClient.zRem(
      rkConTicketPublicRoom(concertId),
      roomId,
    );
    // client.to(roomId).emit('be-send-rank', rank);
    console.log(myRank);
    return myRank;
  }

  addPlayerToRank(concertId: number, userId: number) {
    //  가상 유저 만들기?
    console.log('testing');
    this.redisClient.zAdd('concertRank' + concertId, {
      value: userId + '',
      score: Math.random() * 100,
    });
  }
}
