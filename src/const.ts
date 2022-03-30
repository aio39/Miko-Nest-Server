import { DoneItem } from 'types/share/DoneItem';

export const MAX_PER_ROOM = 5;
export const RANK_RETURN_NUM = 4;

export const doneItem: DoneItem[] = [{ name: 'ハート', price: 5000, id: 0 }];

export const chType = [
  'チャージ',
  'チケット購入',
  'SC送り',
  'アイテム使用',
  'グッズ購入',
  'チケット販売',
  'グッズ販売',
  'SC受け',
  'アイテム受け',
];
export const chChargeIdx = 0;
export const chTicketBuyIdx = 1;
export const chSuperChatSendIdx = 2;
export const chDoneItemSendIdx = 3;
export const chGoodsBuyIdx = 4;
export const chTicketSoldIdx = 5;
export const chGoodsSoldIdx = 6;
export const chSuperChatSendedIdx = 7;
export const chSuperDoneItemSendedIdx = 8;
