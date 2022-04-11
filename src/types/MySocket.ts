import { Users } from 'entities/Users';
import { Socket } from 'socket.io';

export type MySocket = Socket & {
  data: {
    peerId: string;
    userData: Users;
    concertId: number;
    roomId: string;
    userTicketId: number;
    ticketId: number;
    isLeftProper: boolean;
    isEnterProper: boolean;
  };
};
