import { Injectable } from '@nestjs/common';
import { RedisSocketServer } from 'types/RedisSocketServer';

@Injectable()
export class EventsService {
  public socket!: RedisSocketServer;
  // async handleDoneChat() {}
}
