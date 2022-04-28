import { Inject, Injectable } from '@nestjs/common';
import { PushSubscription, sendNotification, setVapidDetails, } from 'web-push';
import * as webPush from 'web-push';
import { Cron } from '@nestjs/schedule';
import { RedisClientType } from 'redis';
import { EventsGateway } from 'events/events.gateway';
import * as dayjs from 'dayjs';
import { VapidServerKey } from 'const';

@Injectable()
export class NotificationService {
  constructor(
    private readonly eventGateway: EventsGateway,
    @Inject('REDIS_CONNECTION') private redisClient: RedisClientType<any, any>,
  ) { }

  async register(req, res) {
        let today = dayjs();
        let startDate = dayjs(req.body.startDate);
        let result = Math.ceil(startDate.diff(today,"minute", true));
        console.log('today', today);
        console.log('startDate', startDate);
        console.log('result', result);
        const concertId = req.body.concertData.id;
        const subscription = JSON.stringify(req.body.Subscription);

        // this.redisClient.lPush(concertId, sbscription);
        this.redisClient.zAdd('notification', {value: concertId, score: result});
        this.redisClient.sAdd('notify-'+concertId, subscription);
      }
    
    async sendNotify(sendMembers :PushSubscription[]){
      console.log('sendNotify-req', sendMembers, sendMembers.length, sendMembers[0], sendMembers);
      
        const options = {
            TTL: 24 * 60 * 60,
            vapidDetails: {
              subject: 'http://localhost:3000', // 서버 주소
              publicKey: VapidServerKey,
              privateKey: process.env.VAPID_PRIVATE_KEY,
            },
        }
        const payload = JSON.stringify({
            title: 'Miko-Concert',
            body: '콘서트 시작 60분 전입니다.',
            icon: 'http://localhost:3000/icon.png',
            tag: 'default tag',
          });
        
          if(sendMembers.length == 1){
            webPush.sendNotification(sendMembers[0], payload, options).catch( error => {
              console.log(error);
          }) ;
          }else{
          try {
            await Promise.all(sendMembers.map((t) => webPush.sendNotification(t, payload, options)));
          } catch (e) {
            console.error(e);
          }
        }
         //sendMembers.splice(0, sendMembers.length);
    }

    @Cron('45 * * * * *')
    async handleCron() {
      const members = await this.redisClient.zRange('notification', 0,-1);
      if(members) {
        this.redisClient.zIncrBy('notification', -1, members.toString());
        const timeout = await this.redisClient.zRangeByScore('notification', 30, 30);
        if(timeout){
          timeout.map(async(data) => {
          const tokenList: PushSubscription[] = [];
          const sendMembers = await this.redisClient.sMembers('notify-' + data);
          for(let i = 0; i < sendMembers.length; i++){
            tokenList.push(JSON.parse(sendMembers[i]));
          }
          this.sendNotify(tokenList);
          //this.redisClient.del('notify-' + data);
          //this.redisClient.zRem('notification', data);
        })
      }
    }
      
      //const request = { title: 'Miko-Concert', body: '곧 시작합니다.', icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png', tag: 'hello' };
    }
}
