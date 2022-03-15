import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MAX_PER_ROOM } from 'const';
import { RedisClientType } from 'redis';
import { Server, Socket } from 'socket.io';
import { RedisSocketServer } from 'types/RedisSocketServer';
import { EventsService } from './events.service';
@Injectable()
@WebSocketGateway(3002, {
  transports: ['websocket'],
  namespace: '/',
  cors: { origin: '*' },
})
// OnGatewayDisconnect
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    private readonly eventsService: EventsService,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) {}
  @WebSocketServer()
  server!: RedisSocketServer;

  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Socket Server Init ✅');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
    // client.leave(client.id); // 자기 자신방 나감
  }

  @SubscribeMessage('disconnecting')
  handleDisconnecting(client: Socket, reason) {
    //  Socket이 Room에서 제거되기전 Fire
    this.logger.log(`Client Disconnecting : ${client.id}`);
    console.log(client.rooms, 'reason', reason);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: Socket, reason) {
    //  Socket이 Room에서 제거되기전 Fire
    this.logger.log(`Client Disconnect : ${client.id}`);
    console.log(client.rooms, 'reason', reason);
  }

  // handleDisconnect(client: Socket) {
  //   this.logger.log(`Client Disconnected : ${client.id}`);
  //   console.log(client.rooms);
  // }

  // fe-new-user-request-join -> 방에 들어 오기를 요청
  // be-new-user-come -> 기존 유저들에게 신규 유저가 왔다고 알림
  // fe-answer-send-peer-id -> 기존 유저들이 신규유저에게 자신의 Peer를 알려줌.
  // be-broadcast-peer-id -> 알려준 PeerId를 전파함.
  @SubscribeMessage('fe-new-user-request-join')
  async handleNewUserRequestJoin(
    client: Socket,
    [peerId, roomId, userData, concertId],
  ) {
    client.data['peerId'] = peerId;
    client.data['userData'] = userData;
    client.data['concertId'] = concertId;

    // const curNumInRoom = this.server.adapter.rooms.get(roomId)?.size || 0;
    const curNumInRoom = (await this.server.adapter.sockets(new Set([roomId])))
      .size;
    console.log('new user request join', curNumInRoom);

    if (curNumInRoom < MAX_PER_ROOM) {
      client.join(roomId);
      client.data['roomId'] = roomId;
      client.to(roomId).emit('be-new-user-come', peerId, roomId, userData);
      this.redisClient.ZINCRBY('PublicRoom' + concertId, 1, roomId);
    } else {
      client.emit('be-fail-enter-room');
      this.redisClient.zAdd('PublicRoom' + concertId, {
        value: roomId,
        score: MAX_PER_ROOM,
      });
    }
    if (concertId) client.join(roomId);
  }

  @SubscribeMessage('fe-answer-send-peer-id')
  handleAnswerSendPeerId(client: Socket, [roomId, peerID, userData]) {
    console.log('broadcastPeerId', roomId, peerID);
    client.to(roomId).emit('be-broadcast-peer-id', peerID, userData);
  }

  @SubscribeMessage('fe-user-left')
  handleUserLeft(client: Socket, [peerId, roomId, concertId]) {
    this.logger.log('fe-user-left', client.id);
    // Socket 처리
    client.leave(roomId);
    client.leave(concertId);
    client.to(roomId).emit('be-user-left', peerId);
    // Redis 처리
    this.redisClient.ZINCRBY('PublicRoom' + concertId, -1, client.data.roomId);
  }

  @SubscribeMessage('fe-send-message')
  handleBroadcastNewMessage(client: Socket, [data, roomId]: [string, string]) {
    console.log(data);
    client.emit('be-broadcast-new-message', data);
    client.to(roomId).emit('be-broadcast-new-message', data);
  }
}
