import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
@Injectable()
export class AppService {
  // constructor(
  //   private readonly orm: MikroORM,
  //   private readonly em: EntityManager,
  // ) {}
  constructor(
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) {}

  root(): string {
    return 'Hello World!';
  }

  async redisTest(key: string) {
    const prefix = 'laravel_database_laravel_cache:';
    try {
      const data = await this.redisClient.get(prefix + key);
      return { test: 'success', data };
    } catch (error) {
      console.log('error', key, error);
    }
    return false;
  }
}
