import { Inject, Injectable } from '@nestjs/common';
import { PushSubscription, sendNotification, setVapidDetails, } from 'web-push';
import * as webPush from 'web-push';
import { Cron } from '@nestjs/schedule';
import { RedisClientType } from 'redis';
import { EventsGateway } from 'events/events.gateway';
import * as dayjs from 'dayjs';
import { VapidServerKey } from 'const';

const Concert30MinTime = 30;
const ConcertStartedTime = 0;

@Injectable()
export class NotificationService {
  constructor(
    private readonly eventGateway: EventsGateway,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) { }

  async register(req) {
        let today = dayjs();
        let startDate = dayjs(req.body.startDate);
        let result = Math.ceil(startDate.diff(today, "minute", true));

        const concertId = req.body.concertData.id;
        const subscription = JSON.stringify(req.body.Subscription);

        const concertTitle = req.body.concertData.title;
        const concertImage = 'https://img.mikopj.live/' + req.body.concertData.coverImage;
        const concertData = JSON.stringify({"title" : concertTitle, "coverImage" : concertImage});

        this.redisClient.zAdd('notification', {value: concertId, score: result});
        this.redisClient.hSet('notify-'+concertId, subscription, concertData);
      }
    
    async sendNotify(sendMembers :PushSubscription[], concertData, concertStartTime){
        const options = {
            TTL: 24 * 60 * 60,
            vapidDetails: {
              subject: 'http://localhost:3000', // 'https://view.mikopj.live/'
              publicKey: VapidServerKey,
              privateKey: process.env.VAPID_PRIVATE_KEY,
            },
        }
        const payload = JSON.stringify({
            title: concertData.title,
            body: concertStartTime ? `콘서트 시작 ${concertStartTime}분 전입니다.` : '콘서트가 시작되었습니다!',
            icon: concertData.coverImage,
            tag: 'default tag',
          });
        
        sendMembers.length == 1 ? webPush.sendNotification(sendMembers[0], payload, options) : 
                                  await Promise.all(sendMembers.map((t) => webPush.sendNotification(t, payload, options)));
    }

    @Cron('45 * * * * *')
    async handleCron() {
      const members = await this.redisClient.zRange('notification', 0,-1);
      if(members.length) {
        members.map((member) => {
          this.redisClient.zIncrBy('notification', -1, member);
        });
        const timeout30Min = await this.redisClient.zRangeByScore('notification', Concert30MinTime, Concert30MinTime);

        if(timeout30Min){
          timeout30Min.map(async(data) => {
          const tokenList: PushSubscription[] = [];
          const sendMembersKey = await this.redisClient.hKeys('notify-' + data);
          const sendMembersValue = await this.redisClient.hGet('notify-' + data, sendMembersKey[0]);
          for(let i = 0; i < sendMembersKey.length; i++){
            tokenList.push(JSON.parse(sendMembersKey[i]));
          }
          this.sendNotify(tokenList, JSON.parse(sendMembersValue!), Concert30MinTime);
        })
      }

      const timeout = await this.redisClient.zRangeByScore('notification', ConcertStartedTime, ConcertStartedTime);
      if(timeout){
        timeout.map(async(data) => {
        const tokenList: PushSubscription[] = [];
        const sendMembersKey = await this.redisClient.hKeys('notify-' + data);
        const sendMembersValue = await this.redisClient.hGet('notify-' + data, sendMembersKey[0]);
        for(let i = 0; i < sendMembersKey.length; i++){
          tokenList.push(JSON.parse(sendMembersKey[i]));
          this.redisClient.hDel('notify-' + data, sendMembersKey[i]);
        }
        this.sendNotify(tokenList, JSON.parse(sendMembersValue!), ConcertStartedTime);
        this.redisClient.zRem('notification', data);
      })
      }
    }
    }
}