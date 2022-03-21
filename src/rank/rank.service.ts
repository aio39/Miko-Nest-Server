import { Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from 'events/events.gateway';
import { RedisClientType } from 'redis';

@Injectable()
export class RankService {
  constructor(
    private readonly eventGateway: EventsGateway,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) {}

  async getRank(concertId: number) {
    //  결과 페이지
    const rank = await this.redisClient.zRangeWithScores(
      'PublicRoom' + concertId,
      0,
      -1,
      { REV: true },
    );
    return rank;
  }

  async getMyRank(concertId: string, roomId: string) {
    // 자기랭크 반환
    const myRank = await this.redisClient.zRem(
      'PublicRoom' + concertId,
      roomId,
    );
    // client.to(roomId).emit('be-send-rank', rank);
    console.log(myRank);
    return myRank;
  }

  addPlayerToRank(concertId: string, userId: string) {
    //  가상 유저 만들기?
    console.log('testing');
    this.redisClient.zAdd('concertRank' + concertId, {
      value: userId,
      score: Math.random() * 100,
    });
  }
}
