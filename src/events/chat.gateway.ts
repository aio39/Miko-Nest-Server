import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {
  chDoneItemSendIdx,
  chSuperChatSendedIdx,
  chSuperChatSendIdx,
  chSuperDoneItemSendedIdx,
  doneItem,
} from 'const';
import { Chats } from 'entities/Chats';
import { Concerts } from 'entities/Concerts';
import { Users } from 'entities/Users';
import { EventsGateway } from 'events/events.gateway';
import {
  createRpConTicketAddedChatForM,
  createRpConTicketAmountDoneForM,
  createRpConTicketAmountSuChatForM,
} from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';
import { MySocket } from 'types/MySocket';
import { ChatMessageInterface } from 'types/share/ChatMessageType';
import { DoneSendInterface } from 'types/share/DoneItem';
import { CoinHistories } from '../entities/CoinHistories';
import { EventsService } from './events.service';

@Injectable()
@WebSocketGateway({
  transports: ['polling', 'websocket'],
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
    @InjectRepository(Concerts)
    private readonly concertsRepository: EntityRepository<Concerts>,
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

    // SuerChat인 경우
    if (data.amount) {
      const streamerPromise = this.concertsRepository.findOneOrFail(
        { id: concertId },
        { populate: ['user'] },
      );

      const viewer = await this.usersRepository.findOneOrFail({
        id: client.data.userData.id,
      });

      if (viewer.coin < data.amount) {
        console.log(
          `user ${viewer.id} 코인 부족, 소지 ${viewer.coin}, 사용량 : ${data.amount}`,
        );
        return client.emit('be-error');
      } else {
        viewer.coin -= data.amount;
      }

      this.redisClient.HINCRBY(
        ...createRpConTicketAmountSuChatForM(concertId, ticketId, data.amount),
      );

      const viewerCoinHistory = new CoinHistories();

      viewerCoinHistory.userId = viewer.id;
      viewerCoinHistory.variation = -data.amount;
      viewerCoinHistory.chat = chat;
      viewerCoinHistory.type = chSuperChatSendIdx;
      viewerCoinHistory.ticketId = ticketId;

      const streamerCoinHistory = new CoinHistories();

      streamerCoinHistory.userId = (await streamerPromise).id;
      streamerCoinHistory.variation = data.amount;
      streamerCoinHistory.chat = chat;
      streamerCoinHistory.type = chSuperChatSendedIdx;
      streamerCoinHistory.ticketId = ticketId;

      // TODO 이거 이렇게 하면 chat 하나만 만들어지나 ?
      this.coinHistoriesRepository.persistAndFlush([
        viewerCoinHistory,
        streamerCoinHistory,
      ]);
      this.usersRepository.persistAndFlush(viewer);
    }

    this.redisClient.HINCRBY(
      ...createRpConTicketAddedChatForM(concertId, ticketId),
    );
    this.chatsRepository.persistAndFlush(chat);

    client.emit('be-broadcast-new-message', data); // 자기 자신에게
    client.to(client.data.ticketId + '').emit('be-broadcast-new-message', data);
  }

  @SubscribeMessage('fe-send-done')
  async handleBroadcastDoneItem(client: MySocket, data: DoneSendInterface) {
    const {
      concertId,
      ticketId,
      userTicketId,
      userData: { id: userId },
    } = client.data;
    const { itemId, sender, timestamp } = data;
    const { price } = doneItem[itemId];

    const streamerPromise = this.concertsRepository.findOneOrFail(
      { id: concertId },
      { populate: ['user'] },
    );

    const viewer = await this.usersRepository.findOneOrFail({
      id: client.data.userData.id,
    });

    if (viewer.coin < price) {
      console.log(
        `user ${viewer.id} 코인 부족, 소지 ${viewer.coin}, 사용량 : ${price}`,
      );
      return client.emit('be-error');
    }

    client.emit('be-broadcast-done-item', data); // 자기 자신에게
    client.to(client.data.ticketId + '').emit('be-broadcast-done-item', data);

    viewer.coin -= price;

    this.redisClient.HINCRBY(
      ...createRpConTicketAmountDoneForM(concertId, ticketId, price),
    );

    const viewerCoinHistory = new CoinHistories();

    viewerCoinHistory.userId = viewer.id;
    viewerCoinHistory.variation = -price;
    viewerCoinHistory.type = chDoneItemSendIdx;
    viewerCoinHistory.concertId = concertId;
    viewerCoinHistory.ticketId = ticketId;

    const streamerCoinHistory = new CoinHistories();

    streamerCoinHistory.userId = (await streamerPromise).id;
    streamerCoinHistory.variation = price;
    streamerCoinHistory.type = chSuperDoneItemSendedIdx;
    streamerCoinHistory.concertId = concertId;
    streamerCoinHistory.ticketId = ticketId;

    this.coinHistoriesRepository.persistAndFlush([
      viewerCoinHistory,
      streamerCoinHistory,
    ]);
    this.usersRepository.persistAndFlush(viewer);
  }
}
