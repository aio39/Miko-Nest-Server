import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Chats } from 'entities/Chats';
import { Users } from 'entities/Users';
import { EventsGateway } from 'events/events.gateway';
import { rkQuiz } from 'helper/createRedisKey/createRedisKey';
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
export class QuizGateway {
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

  @SubscribeMessage('fe-send-quiz-choice')
  handleFeSendQuizChoice(client: MySocket, [quizId, choice]: [number, number]) {
    this.redisClient.HINCRBY(rkQuiz(quizId), choice + '', 1);
  }
}
