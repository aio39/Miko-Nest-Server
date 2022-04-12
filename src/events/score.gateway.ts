import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Chats } from 'entities/Chats';
import { Users } from 'entities/Users';
import { EventsGateway } from 'events/events.gateway';
import {
  createRpConTicketAddedScoreForM,
  rkConTicketScoreRanking,
} from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';
import { MySocket } from 'types/MySocket';
import { CoinHistories } from '../entities/CoinHistories';
import { EventsService } from './events.service';

@Injectable()
@WebSocketGateway({
  transports: ['websocket'],
  namespace: '/',
  cors: { origin: '*' },
})
export class ScoreGateway {
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

  @SubscribeMessage('fe-update-score')
  async handleUpdateScore(
    client: MySocket,
    [addedScore, updatedScore]: [number, number],
  ) {
    const { ticketId, concertId } = client.data;
    // TODO Reconnect 이벤트로 다시 접속하기 전에 , score update는 계속 진행중
    // 랭킹 업데이트
    const redisUpdatedScore = await this.redisClient.ZINCRBY(
      rkConTicketScoreRanking(ticketId),
      addedScore,
      client.data.userData.name,
    );
    // console.log('redisUpdatedScore,', redisUpdatedScore);

    if (redisUpdatedScore !== updatedScore) {
      //  부정 행위 업데이트
      // console.log('부정 행위', redisUpdatedScore, addedScore, updatedScore);
      // await this.redisClient.ZINCRBY(
      //   rkConcertScoreRanking(ticketId),
      //   -updatedScore,
      //   client.data.peerId,
      // );
    }
    // X분간 추가된 점수 업데이트
    this.redisClient.HINCRBY(
      ...createRpConTicketAddedScoreForM(concertId, ticketId, addedScore),
    );
  }
}
