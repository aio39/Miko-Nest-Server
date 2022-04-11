import { RedisAdapter } from '@socket.io/redis-adapter';
import { Server, Socket } from 'socket.io';

// NOTE InstanceType으로 안해주면 메소드 못 찾아줌.
export type RedisSocketServer = {
  adapter: RedisAdapter;
} & Omit<InstanceType<typeof Server>, 'adapter'>;

export type DSocket = typeof Socket & {
  data: {
    concertId: number;
    peerId: string;
    roomId: string;
  };
};
