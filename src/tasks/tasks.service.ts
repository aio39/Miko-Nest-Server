import { S3Client } from '@aws-sdk/client-s3';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { RANK_RETURN_NUM } from 'const';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { ConcertAddedScorePerTimes } from 'entities/ConcertAddedScorePerTimes';
import { CoTiAddedChatPerTimes } from 'entities/CoTiAddedChatPerTimes';
import { CoTiAmountDonePerTimes } from 'entities/CoTiAmountDonePerTimes';
import { CoTiAmountSuperChatPerTimes } from 'entities/CoTiAmountSuperChatPerTimes';
import { CoTiCurEnterUserNums } from 'entities/CoTiCurEnterUserNums';
import { Recordings } from 'entities/Recordings';
import { Tickets } from 'entities/Tickets';
import { UserTicket } from 'entities/UserTicket';
import { EventsGateway } from 'events/events.gateway';
import {
  rkConTicketAddedChatForM,
  rkConTicketAddedScoreForM,
  rkConTicketAmountDoneForM,
  rkConTicketAmountSuChatForM,
  rkConTicketEnterUserNum,
  rkConTicketScoreRanking,
} from 'helper/createRedisKey/createRedisKey';
import { RedisClientType } from 'redis';
import { RecordingStateChangeEvent } from 'types/aws/event/IvsEventBrdigeEvent';
import { rkConTicketPublicRoom } from './../helper/createRedisKey/createRedisKey';
dayjs.extend(customParseFormat);
// import timezone from 'dayjs/plugin/timezone';
// dayjs.extend(timezone);
// dayjs.tz.setDefault('Asia/Tokyo');
@Injectable()
export class TasksService {
  constructor(
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
    @InjectRepository(ConcertAddedScorePerTimes)
    private readonly concertAddedScorePerTime: EntityRepository<ConcertAddedScorePerTimes>,
    @InjectRepository(CoTiAddedChatPerTimes)
    private readonly coTiAddedChatPerTimes: EntityRepository<CoTiAddedChatPerTimes>,
    @InjectRepository(CoTiAmountDonePerTimes)
    private readonly coTiAmountDonePerTimes: EntityRepository<CoTiAmountDonePerTimes>,
    @InjectRepository(CoTiAmountSuperChatPerTimes)
    private readonly coTiAmountSuperChatPerTimes: EntityRepository<CoTiAmountSuperChatPerTimes>,
    @InjectRepository(CoTiCurEnterUserNums)
    private readonly coTiCurEnterUserNums: EntityRepository<CoTiCurEnterUserNums>,
    @InjectRepository(Tickets)
    private readonly ticketRepo: EntityRepository<Tickets>,
    @InjectRepository(UserTicket)
    private readonly userTicketRepo: EntityRepository<UserTicket>,
    @InjectRepository(Recordings)
    private readonly recordingRepo: EntityRepository<Recordings>,

    private readonly eventGateway: EventsGateway,
  ) {}

  private readonly logger = new Logger(TasksService.name);

  private readonly sqsClient = new SQSClient({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS as string,
      secretAccessKey: process.env.AWS_SECRET as string,
    },
  });

  private readonly s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS as string,
      secretAccessKey: process.env.AWS_SECRET as string,
    },
  });

  @Cron('* * * * *', { name: 'everyMinuteJob' })
  async everyMinuteJob() {
    console.log('Cron Job - everyMinuteJob', new Date().toISOString());
    try {
      this.updateConcertAddedScoreForM();
      this.updateConTicketAddedChatForM();
      this.updateCoTiAmountDonePerTimes();
      this.updateCoTiAmountSuperChatForM();
      this.updateCoTiCurEnterUserNums();
    } catch (error) {
      console.log(error);
    }
  }

  // N(1)??? ?????? ????????? ????????? ????????? ????????? ???????????? DB??? ?????? 0?????? ?????????
  // @Cron('0 * * * * *') // ??? 0??? 0??? ??????
  async updateConcertAddedScoreForM() {
    console.log('Cron Job updateConcertAddedScoreForM');
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketAddedScoreForM(),
    );
    this.redisClient.DEL(rkConTicketAddedScoreForM());
    console.log(hashResult);
    const dataList: ConcertAddedScorePerTimes[] = [];

    for (const [key, score] of Object.entries(hashResult)) {
      const data = new ConcertAddedScorePerTimes();
      data.addedScore = parseInt(score);
      const [concertId, ticketId] = key.split('/');
      console.log('concert score', concertId, ticketId);
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
      dataList.push(data);
    }

    console.log(dataList);
    this.concertAddedScorePerTime.persistAndFlush(dataList);
  }

  // TODO  1??? ????????? ????????????
  // @Cron('0 * * * * *') // ??? 0??? 0??? ??????
  async updateCoTiAmountDonePerTimes() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketAmountDoneForM(),
    );
    this.redisClient.DEL(rkConTicketAmountDoneForM());

    const dataList: CoTiAmountDonePerTimes[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const data = new CoTiAmountDonePerTimes();
      data.amount = parseInt(amount);
      const [concertId, ticketId] = key.split('/');
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
      dataList.push(data);
    }

    this.coTiAmountDonePerTimes.persistAndFlush(dataList);
  }

  // TODO 1??? ????????? ?????????
  // @Cron('0 * * * * *') // ??? 0??? 0??? ??????
  async updateCoTiAmountSuperChatForM() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketAmountSuChatForM(),
    );
    this.redisClient.DEL(rkConTicketAmountSuChatForM());

    const dataList: CoTiAmountSuperChatPerTimes[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const data = new CoTiAmountSuperChatPerTimes();
      data.amount = parseInt(amount);
      const [concertId, ticketId] = key.split('/');
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
      dataList.push(data);
    }

    this.coTiAmountSuperChatPerTimes.persistAndFlush(dataList);
  }

  // TODO 1??? ????????? ????????????
  // @Cron('0 * * * * *') // ??? 0??? 0??? ??????
  async updateConTicketAddedChatForM() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketAddedChatForM(),
    );
    this.redisClient.DEL(rkConTicketAddedChatForM());

    const dataList: CoTiAddedChatPerTimes[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const data = new CoTiAddedChatPerTimes();
      data.added = parseInt(amount);
      const [concertId, ticketId] = key.split('/');
      data.concertId = parseInt(concertId);
      data.ticketId = parseInt(ticketId);
      dataList.push(data);
    }

    this.coTiAddedChatPerTimes.persistAndFlush(dataList);
  }

  // TODO ????????? ?????? ?????????
  // @Cron('0 * * * * *') // ??? 0??? 0??? ??????
  async updateCoTiCurEnterUserNums() {
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketEnterUserNum(),
    );
    // ????????? ?????? ????????? ????????? ?????? ??????.
    // this.redisClient.DEL(rkConTicketEnterUserNum());

    const dataList: CoTiCurEnterUserNums[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const data = new CoTiCurEnterUserNums();
      if (key !== 'undefined/undefined') {
        data.nums = amount ? parseInt(amount) : 0;
        const [concertId, ticketId] = key.split('/');
        data.concertId = parseInt(concertId);
        data.ticketId = parseInt(ticketId);
        dataList.push(data);
      }
    }

    this.coTiCurEnterUserNums.persistAndFlush(dataList);
  }

  // TODO ????????? ?????? ??????
  @Cron('5 * * * * *') // ??? 0??? 5??? ??????
  async cleanUpConcertRedis() {
    // ?????? ???????????? ????????? ???????????? ??????????????? ?????????
    const hashResult = await this.redisClient.HGETALL(
      rkConTicketEnterUserNum(),
    );

    const ticketIdList: number[] = [];
    const concertIdList: number[] = [];

    for (const [key, amount] of Object.entries(hashResult)) {
      const [concertId, ticketId] = key.split('/').map((v) => parseInt(v));
      // ?????? undefined => NaN??? ??????
      if (concertId && ticketId) {
        concertIdList.push(concertId);
        ticketIdList.push(ticketId);
      }
    }

    const tickets = await this.ticketRepo.find({ id: { $in: ticketIdList } });

    tickets.forEach((ticket) => {
      // ????????? ???????????????  ??????
      if (dayjs().isAfter(ticket.concertEndDate)) {
        // ?????? ?????? ??? ?????? ??????
        this.eventGateway.server.to(ticket.id + '').emit('be-go-out-room');

        //  ?????? ?????? ??????
        this.redisClient
          .zRangeWithScores(rkConTicketScoreRanking(ticket.id), 0, -1, {
            REV: true,
          })
          .then(async (rankingResult) => {
            const objectResult = new Map();
            rankingResult.forEach(({ score, value }, idx) => {
              objectResult.set(value, [score, idx]);
            });

            const userTickets = await this.userTicketRepo.find(
              {
                isUsed: true,
                ticketId: ticket.id,
              },
              {
                populate: ['user'],
              },
            );
            userTickets.forEach((userTicket) => {
              userTicket.pRanking =
                objectResult.get(userTicket.user.name)[1] + 1;
            });
            this.userTicketRepo.persistAndFlush(userTickets);
            //  TODO ?????? ?????? ??????
          })
          .then(() => {
            this.redisClient.DEL(rkConTicketScoreRanking(ticket.id));
          });

        //  ?????? ????????? ?????? ?????????  //  ???????????? , ????????? ????????? ??????, N??? ?????????
        this.redisClient.HDEL(rkConTicketEnterUserNum(), [
          ticket.concertId + '/' + ticket.id,
        ]);
        this.redisClient.HDEL(rkConTicketAddedScoreForM(), [
          ticket.concertId + '/' + ticket.id,
        ]);
        this.redisClient.HDEL(rkConTicketAmountDoneForM(), [
          ticket.concertId + '/' + ticket.id,
        ]);
        this.redisClient.HDEL(rkConTicketAmountSuChatForM(), [
          ticket.concertId + '/' + ticket.id,
        ]);
        this.redisClient.HDEL(rkConTicketAddedChatForM(), [
          ticket.concertId + '/' + ticket.id,
        ]);
        this.redisClient.DEL([
          rkConTicketPublicRoom(ticket.id),
          rkConTicketScoreRanking(ticket.id),
        ]);
      }
    });
  }

  @Interval(1500)
  async handleBroadcastRank() {
    const keys = await this.redisClient.keys('ScoreRanking-*');
    keys.map((key) => {
      const ticketId = key.split('-')[1];
      this.redisClient
        .zRangeWithScores(
          rkConTicketScoreRanking(+ticketId),
          0,
          RANK_RETURN_NUM,
          { REV: true },
        )
        .then((rank) => {
          const nameOnlyRank = rank.map(({ score, value }) => ({
            value: value.split('/')[1],
            score,
          }));
          this.eventGateway.server
            .to(ticketId)
            .emit('be-broadcast-rank', nameOnlyRank);
        });
    });
  }

  @Interval(30000)
  async handleRecordingData() {
    const MAX_BATCH = 5;
    const params: ReceiveMessageCommandInput = {
      // AttributeNames: ['SentTimestamp'],
      MaxNumberOfMessages: MAX_BATCH,
      MessageAttributeNames: ['All'],
      QueueUrl: process.env.AWS_SQS_RECORDING,
      VisibilityTimeout: 60,
      WaitTimeSeconds: 10,
    };

    const result = await this.sqsClient.send(new ReceiveMessageCommand(params));
    if (result.$metadata.httpStatusCode === 200) {
      result.Messages?.forEach((msg) => {
        const body = JSON.parse(
          msg.Body as string,
        ) as RecordingStateChangeEvent<'IVS Recording State Change'>;

        this.ticketRepo
          .findOneOrFail({ channelArn: body.resources[0] })
          .then((ticket) => {
            const record = new Recordings();

            switch (body.detail.recording_status) {
              case 'Recording Start':
                const start = dayjs(
                  (
                    body.detail.recording_s3_key_prefix.match(
                      /(\d+\/\d+\/\d+\/\d+\/\d+)/g,
                    ) as RegExpMatchArray
                  )[0],
                  'YYYY/M/D/H/m',
                ).format('YYYY-MM-DD HH:mm:ss');
                record.prefix = body.detail.recording_s3_key_prefix;
                record.ticket = ticket;
                record.start = start;
                record.streamId = body.detail.stream_id;
                this.recordingRepo.persistAndFlush(record);
                break;
              case 'Recording End':
                this.recordingRepo
                  .findOneOrFail({ streamId: body.detail.stream_id })
                  .then((record) => {
                    // const end = dayjs(body.time);
                    const end = dayjs(record.start).add(
                      body.detail.recording_duration_ms,
                      'ms',
                    );

                    record.end = end.format('YYYY-MM-DD HH:mm:ss');
                    record.ticket = ticket;
                    record.streamId = body.detail.stream_id;
                    this.recordingRepo.persistAndFlush(record);
                  });
                break;
              case 'Recording Start Failure':
              case 'Recording End Failure':
              default:
                break;
            }

            this.sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: process.env.AWS_SQS_RECORDING,
                ReceiptHandle: msg.ReceiptHandle,
              }),
            );
          })
          .catch((err) => {
            console.error('ticket not found', err);
          });
      });
    }
  }
}
