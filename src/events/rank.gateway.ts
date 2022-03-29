import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { RANK_RETURN_NUM } from 'const';
import { Chats } from 'entities/Chats';
import { Users } from 'entities/Users';
import { EventsGateway } from 'events/events.gateway';
import { rkConTicketScoreRanking } from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';
import { MySocket } from 'types/MySocket';
import { CoinHistories } from '../entities/CoinHistories';
import { EventsService } from './events.service';

@Injectable()
@WebSocketGateway(3002, {
  transports: ['websocket'],
  namespace: '/',
  cors: { origin: '*' },
})
export class RankGateway {
  constructor(
    private readonly eventsService: EventsService,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
    @InjectRepository(Chats)
    private readonly chatsRepository: EntityRepository<Chats>,
    @InjectRepository(CoinHistories)
    private readonly coinHistoriesRepository: EntityRepository<CoinHistories>,
    @InjectRepository(Users)
    private readonly usersRepository: EntityRepository<Users>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @SubscribeMessage('fe-rank')
  async handleBroadcastNewRank(client: MySocket, ticketId: number) {
    // 이거는 특정 콘서트의 모든 랭킹 key : value
    const rank = await this.redisClient.zRangeWithScores(
      rkConTicketScoreRanking(ticketId),
      0,
      RANK_RETURN_NUM,
      { REV: true },
    );
    client.emit('be-broadcast-new-rank', rank);
  }

  @SubscribeMessage('fe-myRank')
  async handleGetMyRank(client: MySocket, ticketId: number) {
    const { userData } = client.data;

    const myRank = await this.redisClient.zScore(
      rkConTicketScoreRanking(ticketId),
      userData.name,
    );
    client.emit('be-broadcast-new-rank', myRank);
  }

  @SubscribeMessage('fe-get-myRank')
  async handleGetMyScore(client: MySocket) {
    const { userData, ticketId } = client.data;

    const myRankIdx = await this.redisClient.zRevRank(
      rkConTicketScoreRanking(ticketId),
      userData.name,
    );

    if (myRankIdx || myRankIdx === 0) {
      client.emit('be-update-myRank', myRankIdx + 1);
    }
  }
}