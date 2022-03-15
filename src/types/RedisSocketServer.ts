import { RedisAdapter } from '@socket.io/redis-adapter';
import { Server, Socket } from 'socket.io';

export type RedisSocketServer = typeof Server & {
  adapter: RedisAdapter;
};

export type DSocket = typeof Socket & {
  data: {
    concertId: number;
    peerId: string;
    roomId: string;
  };
};
