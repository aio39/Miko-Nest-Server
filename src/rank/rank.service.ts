import { Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from 'events/events.gateway';
import { rkConTicketPublicRoom } from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';

@Injectable()
export class RankService {
  constructor(
    private readonly eventGateway: EventsGateway,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) { }

  async getRank(concertId: number) {
    const rank = await this.redisClient.zRangeWithScores('PublicRoom' + concertId, 0, -1, { REV: true });
    return rank;
  }

}
