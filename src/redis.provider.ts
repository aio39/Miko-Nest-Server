import { RedisClientType } from '@node-redis/client';
import { createClient } from 'redis';

export const redisProviders = [
  {
    provide: 'REDIS_CONNECTION',
    useFactory: async (): Promise<RedisClientType<any, any>> => {
      const port = process.env.REDIS_PORT || 6379;
      const host = process.env.REDIS_URL || 'localhost';

      const redisClient = createClient({
        url: `redis://${host}:${port}`,
      });

      redisClient.on('error', (err) =>
        console.log('Redis redisClient Error', err),
      );
      await redisClient.connect();

      return redisClient;
    },
  },
];
