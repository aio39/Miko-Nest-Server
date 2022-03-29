import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Chats } from 'entities/Chats';
import { Users } from 'entities/Users';
import { EventsGateway } from 'events/events.gateway';
import { RedisClientType } from 'redis';
import { MySocket } from 'types/MySocket';
import { ChatMessageInterface } from 'types/share/ChatMessageType';
import { CoinHistories } from '../entities/CoinHistories';
import { EventsService } from './events.service';

@Injectable()
@WebSocketGateway(3002, {
  transports: ['websocket'],
  namespace: '/',
  cors: { origin: '*' },
})
export class ChatGateway {
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

  // 파라메터가 한개일떄는 그냥 받고, 2개 이상  일떄는 배열로 받는다.
  @SubscribeMessage('fe-send-message')
  async handleBroadcastNewMessage(
    client: MySocket,
    data: ChatMessageInterface,
  ) {
    const {
      concertId,
      ticketId,
      userTicketId,
      userData: { id: userId },
    } = client.data;

    const chat = new Chats();
    chat.userId = userId;
    chat.ticketId = ticketId;
    chat.text = data.text;

    if (data.amount) {
      // SuerChat인 경우
      const user = await this.usersRepository.findOneOrFail({
        id: client.data.userData.id,
      });
      if (user.coin < data.amount) {
        console.log(
          `user ${user.id} 코인 부족, 소지 ${user.coin}, 사용량 : ${data.amount}`,
        );
        return client.emit('be-error');
      }

      const coinHistory = new CoinHistories();

      coinHistory.userId = user.id;
      coinHistory.variation = data.amount;
      coinHistory.chat = chat;
      coinHistory.ticketId = ticketId;

      await this.coinHistoriesRepository.persistAndFlush(coinHistory);
    } else {
      this.chatsRepository.persistAndFlush(chat);
    }

    client.emit('be-broadcast-new-message', data); // 자기 자신에게
    client.to(client.data.ticketId + '').emit('be-broadcast-new-message', data);
  }
}
