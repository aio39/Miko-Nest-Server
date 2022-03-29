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
import { RedisClientType } from 'redis';
import { Server } from 'socket.io';
import { MySocket } from 'types/MySocket';
import { RedisSocketServer } from 'types/RedisSocketServer';
import { CoinHistories } from './../entities/CoinHistories';
import { EventsService } from './events.service';

@Injectable()
@WebSocketGateway(3002, {
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
    // client.leave(client.id); // 자기 자신방 나감
  }

  // handleDisconnect(client: Socket) {
  //   this.logger.log(`Client Disconnected : ${client.id}`);
  //   console.log(client.rooms);
  // }

  // TODO  left-user vs disconnection
  @SubscribeMessage('disconnecting')
  handleDisconnecting(client: MySocket, reason) {
    //  Socket이 Room에서 제거되기전 Fire
    this.logger.log(`Client Disconnecting : ${client.id}`);
    console.log(client.rooms, 'reason', reason);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: MySocket, reason) {
    //  Socket이 Room에서 제거되기전 Fire
    this.logger.log(`Client Disconnect : ${client.id}`);
    console.log(client.rooms, 'reason', reason);
  }
}
