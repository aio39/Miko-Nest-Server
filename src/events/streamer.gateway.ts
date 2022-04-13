import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Chats } from 'entities/Chats';
import { Users } from 'entities/Users';
import { EventsGateway } from 'events/events.gateway';
import { rkConTicketScoreRanking } from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';
import { MySocket } from 'types/MySocket';
import { CoinHistories } from '../entities/CoinHistories';
import { EventsService } from './events.service';

@Injectable()
@WebSocketGateway({
  transports: ['polling', 'websocket'],
  namespace: '/',
  cors: { origin: '*' },
})
export class StreamerGateway {
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

  // @SubscribeMessage('fe-st-join-concert-room')
  // handleStJoinConcertRoom(client: MySocket, ticketId: string) {
  //   client.join(ticketId);
  // }

  @SubscribeMessage('fe-all-rank')
  async handleBroadcastNewRank(
    client: MySocket,
    [ticketId, start = 0, end = 50],
  ) {
    const rank = await this.redisClient.zRangeWithScores(
      rkConTicketScoreRanking(ticketId),
      start,
      end,
      { REV: true },
    );
    client.emit('be-all-rank', rank);
  }
}
