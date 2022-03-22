import { Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from 'events/events.gateway';
import { nanoid } from 'nanoid';
import { RedisClientType } from 'redis';
import Interval from '@nestjs/schedule';

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

    async getMyRank(concertId: string, userId: string) {
        const myRank = await this.redisClient.zScore('concertRank' + concertId, userId);
        return myRank;
    }

    addPlayerToRank(concertId: string, userId: string) {
        this.redisClient.zAdd('concertRank' + concertId, {
            value: userId,
            score: Math.floor(Math.random() * 100)
        });
    }


}
