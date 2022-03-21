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

    async getMyRank(concertId: string, roomId: string) {
        const myRank = await this.redisClient.zRem('PublicRoom' + concertId, roomId);
        // client.to(roomId).emit('be-send-rank', rank);
        console.log(myRank);
        return myRank;
    }

    addPlayerToRank(concertId: string, userId: string) {
        console.log('testing');
        this.redisClient.zAdd('concertRank' + concertId, {
            value: userId,
            score: Math.random() * 100,
        });
    }


}
