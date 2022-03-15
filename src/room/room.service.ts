import { Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from 'events/events.gateway';
import { nanoid } from 'nanoid';
import { RedisClientType } from 'redis';

@Injectable()
export class RoomService {
  constructor(
    private readonly eventGateway: EventsGateway,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) {}

  async enterRandomRoom(concertId: string) {
    const setKey = 'PublicRoom' + concertId;
    const result = await this.redisClient.ZRANGE_WITHSCORES(setKey, 0, 0);

    const roomId = nanoid();
    // 방이 존재 하지 않을때
    console.log(result);
    if (result.length === 0) {
      this.redisClient.ZADD(setKey, { score: 1, value: roomId });
      return nanoid();
    }

    // 모든 방이 5인인 상태
    if (result[0].score >= 5) {
      if (result[0].score > 5) {
        console.error('❌❌❌❌ Bug 방에 5인 초과된 상태임.');
      }
      this.redisClient.ZADD(setKey, { score: 1, value: roomId });
      return nanoid();
    }

    // 현재 가장 인원수가 적은 방에다가 추가해줌,
    // 방에 입장하거나 나갈때마다 Room의 실 Socket 수 만큼 업데이트 해줘야함.
    if (result[0].score <= 4) {
      this.redisClient.ZINCRBY(setKey, 1, result[0].value);
      return result[0].value;
    }
  }
}
