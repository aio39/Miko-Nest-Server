import { Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from 'events/events.gateway';
import { rkQuiz } from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';

@Injectable()
export class ConcertsService {
  constructor(
    private readonly eventGateway: EventsGateway,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) {}

  async getQuizResult(quizId) {
    const result = await this.redisClient.HGETALL(rkQuiz(quizId));
    return result;
  }
}
