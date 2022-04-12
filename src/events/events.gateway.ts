import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Chats } from 'entities/Chats';
import { Users } from 'entities/Users';
import {
  createRpConTicketEnterUserNum,
  rkConTicketPublicRoom,
} from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';
import { Server } from 'socket.io';
import { MySocket } from 'types/MySocket';
import { RedisSocketServer } from 'types/RedisSocketServer';
import { CoinHistories } from './../entities/CoinHistories';
import { EventsService } from './events.service';

@Injectable()
@WebSocketGateway({
  transports: ['websocket'],
  namespace: '/',
  cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    private readonly eventsService: EventsService,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
    @InjectRepository(Chats)
    private readonly chatsRepository: EntityRepository<Chats>,
    @InjectRepository(CoinHistories)
    private readonly coinHistoriesRepository: EntityRepository<CoinHistories>,
    @InjectRepository(Users)
    private readonly usersRepository: EntityRepository<Users>,
  ) {}

  @WebSocketServer()
  server!: RedisSocketServer;

  logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Socket Server Init ✅');
  }

  handleConnection(client: MySocket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
    client.setMaxListeners(0);
    // client.leave(client.id); // 자기 자신방 나감,  // NOTE 이거 하면 왜 메세지 2번씩 중복해서 오지?
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: MySocket, reason) {
    //  Socket이 Room에서 제거되기전 Fire
    this.logger.log(`Client Disconnect : ${client.id}`);
    console.log(client.rooms, 'Disconnect reason', reason);
    console.log('Disconnect', client.data, client.rooms);
  }

  // TODO  left-user vs disconnection
  @SubscribeMessage('disconnecting')
  handleDisconnecting(client: MySocket, reason) {
    //  Socket이 Room에서 제거되기전 Fire
    this.logger.log(`Client Disconnecting : ${client.id}`);
    console.log(client.rooms, 'Disconnecting reason', reason);
    // client namespace disconnect - 유저가 스스로 socket.disconnect()로 끊음
    // transport close , 신호 손실이나 창 강제로 닫기로 인해서 끊어짐.
    console.log('Disconnecting', client.data, client.rooms);

    if (!client.data.isLeftProper && client.data.isEnterProper) {
      const { peerId, concertId, roomId, ticketId } = client.data;
      client.to(roomId + '').emit('be-user-left', peerId);

      this.redisClient.ZINCRBY(
        rkConTicketPublicRoom(ticketId),
        -1,
        client.data.roomId + '',
      );

      this.redisClient.HINCRBY(
        ...createRpConTicketEnterUserNum(concertId, ticketId, -1),
      );
    }
  }
}
