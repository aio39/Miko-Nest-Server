interface ChatMessageInterface {
  sender: string;
  text: string;
  amount?: number;
  itemId?: number;
  timestamp: number;
}

export type { ChatMessageInterface };
