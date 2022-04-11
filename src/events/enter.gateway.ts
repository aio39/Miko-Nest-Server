import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { MAX_PER_ROOM } from 'const';
import { Chats } from 'entities/Chats';
import { Users } from 'entities/Users';
import { EventsGateway } from 'events/events.gateway';
import {
  createRpConTicketEnterUserNum,
  rkConTicketPublicRoom,
  rkConTicketScoreRanking,
} from 'helper/createRedisKey/createRedisKey';
import { isAllExists } from 'helper/isAllExists';
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
export class EnterGateway {
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

  // fe-new-user-request-join -> 방에 들어 오기를 요청
  // be-new-user-come -> 기존 유저들에게 신규 유저가 왔다고 알림
  // fe-answer-send-peer-id -> 기존 유저들이 신규유저에게 자신의 Peer를 알려줌.
  // be-broadcast-peer-id -> 알려준 PeerId를 전파함.
  @SubscribeMessage('fe-new-user-request-join')
  async handleNewUserRequestJoin(
    client: MySocket,
    data: [string, string, Users, number, number, number],
  ) {
    if (!isAllExists(data)) {
      console.log('socket의 데이터가 부족합니다.', data);
      return client.emit('be-back-to-start');
    }

    const [peerId, roomId, userData, concertId, ticketId, userTicketId] = data;
    console.log('new user request join', userData);

    client.data['peerId'] = peerId;
    client.data['userData'] = userData;
    client.data['concertId'] = concertId;
    client.data['userTicketId'] = userTicketId;
    client.data['ticketId'] = ticketId;
    client.data['roomId'] = roomId;
    //  콘서트 방에 입장

    client.join(ticketId + '');

    // const curNumInRoom = this.eventsGateway.server.adapter.rooms.get(roomId)?.size || 0;
    const curNumInRoom = (
      await this.eventsGateway.server.adapter.sockets(new Set([roomId]))
    ).size;

    if (curNumInRoom < MAX_PER_ROOM) {
      // 현재 들어갈 수 있는 방이어서 입장
      client.join(roomId);
      client.data['roomId'] = roomId;
      client.data.isEnterProper = true;
      client
        .to(roomId)
        .emit('be-new-user-come', peerId, roomId, userData, client.id);
      this.redisClient.ZINCRBY(rkConTicketPublicRoom(ticketId), 1, roomId);
      this.redisClient.HINCRBY(
        ...createRpConTicketEnterUserNum(concertId, ticketId, 1),
      );

      // 기존 랭킹 점수 , 처음이면 0
      const userScore = await this.redisClient.ZINCRBY(
        rkConTicketScoreRanking(ticketId),
        0,
        client.data.userData.name,
      );
      console.log('기존 랭킹 점수', userScore);
      if (userScore) client.emit('be-send-user-score', userScore);
    } else {
      // 입장 실패후, redis상의 현 방의 인원수를 Max 숫자로 변경해줌.
      //  이후 Client측에서 새로운 방 번호를 얻어옴.
      client.emit('be-fail-enter-room');
      this.redisClient.zAdd(rkConTicketPublicRoom(ticketId), {
        value: roomId,
        score: MAX_PER_ROOM,
      });
    }
  }

  @SubscribeMessage('fe-answer-send-peer-id')
  handleAnswerSendPeerId(client: MySocket, otherSocketId) {
    const { roomId, peerId, userData } = client.data;
    console.log('broadcastPeerId', roomId, peerId);
    this.eventsGateway.server
      .to(roomId + '')
      .emit('be-broadcast-peer-id', peerId, userData);
  }

  @SubscribeMessage('fe-user-left')
  handleUserLeft(client: MySocket) {
    this.eventsGateway.logger.log('fe-user-left', client.id);
    // Socket 처리
    const { peerId, concertId, roomId, ticketId } = client.data;
    client.leave(roomId + '');
    client.leave(ticketId + '');
    client.to(roomId + '').emit('be-user-left', peerId);
    // Redis 에서도 퇴장 처리
    this.redisClient.ZINCRBY(
      rkConTicketPublicRoom(ticketId),
      -1,
      client.data.roomId + '',
    );

    this.redisClient.HINCRBY(
      ...createRpConTicketEnterUserNum(concertId, ticketId, -1),
    );

    //  isLeft가 작동하지 않았다면 redis 되장 처리가 이루어 지지 않고 끊기어임.
    client.data.isLeftProper = true;
  }
}
