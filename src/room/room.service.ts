import { Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from 'events/events.gateway';
import { rkConcertPublicRoom } from 'helper/createRedisKey/createRedisKey';
import { nanoid } from 'nanoid';
import { RedisClientType } from 'redis';

@Injectable()
export class RoomService {
  constructor(
    private readonly eventGateway: EventsGateway,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) {}

  async enterRandomRoom(concertId: string) {
    const redisKey = rkConcertPublicRoom(concertId);
    const result = await this.redisClient.ZRANGE_WITHSCORES(redisKey, 0, 0);
    const newCreatedRoomId = nanoid();

    // 서버가 처음 시작한 직후로, 방이 존재 하지 않아 새로운 방을 생성
    if (result.length === 0) {
      this.redisClient.ZADD(redisKey, { score: 1, value: newCreatedRoomId });
      return nanoid();
    }

    // 모든 방이 5인 이상이어서 새로운 방을 만들어야 함.
    if (result[0].score >= 5) {
      if (result[0].score > 5) {
        console.error('❌❌❌❌ Bug 방에 5인 초과된 상태임.');
      }
      this.redisClient.ZADD(redisKey, { score: 1, value: newCreatedRoomId });
      return nanoid();
    }

    // 현재 가장 인원수가 적은 방에다가 추가해줌,
    // 방에 입장하거나 나갈때마다는 , ZINCRBY가 아닌 Room의 실제 Socket수로 업데이트.
    if (result[0].score <= 4) {
      this.redisClient.ZINCRBY(redisKey, 1, result[0].value);
      return result[0].value;
    }
  }
}
