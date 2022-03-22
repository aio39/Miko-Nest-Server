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
import { MAX_PER_ROOM } from 'const';
import { Chats } from 'entities/Chats';
import { Users } from 'entities/Users';
import { RedisClientType } from 'redis';
import { Server, Socket } from 'socket.io';
import { RedisSocketServer } from 'types/RedisSocketServer';
import { ChatMessageInterface } from 'types/share/ChatMessageType';
import { CoinHistories } from './../entities/CoinHistories';
import {
  rkConcertPublicRoom,
  rkQuiz,
} from './../helper/createRedisKey/createRedisKey';
import { EventsService } from './events.service';

type MySocket = Socket & {
  data: {
    peerId: string;
    userData: Users;
    concertId: string;
    roomId: string;
    userTicketId: string;
    ticketId: string;
  };
};

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
    @InjectRepository(Chats)
    private readonly chatsRepository: EntityRepository<Chats>,
    @InjectRepository(CoinHistories)
    private readonly coinHistoriesRepository: EntityRepository<CoinHistories>,
    @InjectRepository(Users)
    private readonly usersRepository: EntityRepository<Users>,
  ) { }
  @WebSocketServer()
  server!: RedisSocketServer;

  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Socket Server Init ✅');
  }

  handleConnection(client: MySocket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
    // client.leave(client.id); // 자기 자신방 나감
  }

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
    client: MySocket,
    [peerId, roomId, userData, concertId, ticketId, userTicketId],
  ) {
    console.log('new user request join', userData);
    client.data['peerId'] = peerId;
    client.data['userData'] = userData;
    client.data['concertId'] = concertId;
    client.data['userTicketId'] = userTicketId;
    client.data['ticketId'] = ticketId;
    client.data['roomId'] = roomId;
    //  콘서트 방에 입장
    if (concertId) client.join(roomId);

    // const curNumInRoom = this.server.adapter.rooms.get(roomId)?.size || 0;
    const curNumInRoom = (await this.server.adapter.sockets(new Set([roomId])))
      .size;

    if (curNumInRoom < MAX_PER_ROOM) {
      // 현재 들어갈 수 있는 방이어서 입장
      client.join(roomId);
      client.data['roomId'] = roomId;
      client
        .to(roomId)
        .emit('be-new-user-come', peerId, roomId, userData, client.id);
      this.redisClient.ZINCRBY(rkConcertPublicRoom(concertId), 1, roomId);
    } else {
      // 입장 실패후, redis상의 현 방의 인원수를 Max 숫자로 변경해줌.
      //  이후 Client측에서 새로운 방 번호를 얻어옴.
      client.emit('be-fail-enter-room');
      this.redisClient.zAdd(rkConcertPublicRoom(concertId), {
        value: roomId,
        score: MAX_PER_ROOM,
      });
    }
  }

  @SubscribeMessage('fe-answer-send-peer-id')
  handleAnswerSendPeerId(client: MySocket, otherSocketId) {
    const { roomId, peerId, userData } = client.data;
    console.log('broadcastPeerId', roomId, peerId);
    this.server.to(roomId).emit('be-broadcast-peer-id', peerId, userData);
  }

  @SubscribeMessage('fe-user-left')
  handleUserLeft(client: MySocket) {
    this.logger.log('fe-user-left', client.id);
    // Socket 처리
    const { peerId, concertId, roomId } = client.data;
    client.leave(roomId);
    client.leave(concertId);
    client.to(roomId).emit('be-user-left', peerId);
    // Redis 에서도 퇴장 처리
    this.redisClient.ZINCRBY(
      rkConcertPublicRoom(concertId),
      -1,
      client.data.roomId,
    );
  }

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
    client.to(client.data.concertId).emit('be-broadcast-new-message', data);
  }

  @SubscribeMessage('fe-send-quiz-choice')
  handleFeSendQuizChoice(client: MySocket, [quizId, choice]: [string, string]) {
    this.redisClient.HINCRBY(rkQuiz(quizId), choice, 1);
  }

  @SubscribeMessage('fe-update-score')
  handleUpdateScore(
    client: MySocket,
    [addedScore, updatedScore]: [number, number],
  ) {
    // update score
  }

  // For Streamer
  @SubscribeMessage('fe-st-join-concert-room')
  handleStJoinConcertRoom(client: MySocket, concertId: string) {
    client.join(concertId);
  }

  // @SubscribeMessage('fe-st-request-quiz-result')
  // handleStRequestQuizResult(client: MySocket, [quizId]: [string]) {
  //   client.emit('be-send-to-st-quiz-data');
  // }


  //rank
  @SubscribeMessage('fe-rank')
  async handleBroadcastNewRank(client: Socket, concertId) {
    const rank = await this.redisClient.zRangeWithScores('concertRank' + concertId, 0, -1, { REV: true });
    client.emit('be-broadcast-new-rank', rank);
    const count = await this.redisClient.zCard('concertRank' + concertId) //키에 속한 멤버 수
  }



}
