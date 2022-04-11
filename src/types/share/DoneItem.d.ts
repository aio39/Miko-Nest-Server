export interface DoneItem {
  price: number;
  name: string;
  id: number;
}

export interface DoneSendInterface {
  sender: string;
  itemId: number;
  timestamp: number;
}
