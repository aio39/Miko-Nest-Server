import { Users } from 'entities/Users';

export interface ChatMessageInterface {
  sender: string;
  text: string;
  amount?: number;
  timestamp: number;
  user?: Users;
}
