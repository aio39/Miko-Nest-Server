import { DoneItem } from 'types/share/DoneItem';

export const MAX_PER_ROOM = 5;
export const RANK_RETURN_NUM = 4;

export const doneItem: DoneItem[] = [
  { name: 'ハート', price: 5000, id: 0 },
  { name: 'コンペート', price: 6000, id: 1 },
  { name: 'スター', price: 2500, id: 2 },
  { name: 'ギフト', price: 100000, id: 3 },
  { name: '日々', price: 75000, id: 4 },
  { name: 'キラキラ', price: 4000, id: 5 },
  { name: 'キラキラ', price: 4000, id: 6 },
];

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

export const IVS_RECORD_ARN =
  'arn:aws:ivs:us-east-1:121323684128:recording-configuration/LqC0slRVX5q1';

//web-push key
export const VapidServerKey =
  'BNAgp0hyZG175VVckUdf-YGtg-dTmJjpaaunHi83G5LGWdwClOhbv6JMgsu9d-yAL2es-Y7V_YX060EUCXmsnoQ';
export const VapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
