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

  @SubscribeMessage('fe-get-myRank')
  async handleGetMyScore(client: MySocket) {
    const { userData, ticketId } = client.data;

    // TODO 점수도 같이 얻어와서 보내기
    const myRankIdx = await this.redisClient.zRevRank(
      rkConTicketScoreRanking(ticketId),
      userData.name,
    );

    if (myRankIdx || myRankIdx === 0) {
      client.emit('be-update-myRank', myRankIdx + 1);
    }
  }
}
